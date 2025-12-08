// SSE endpoint for streaming enrichment progress with parallel execution
// Achieves 5-10 second enrichment (vs 30-60 seconds sequential)
import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { enrichContactParallel } from '@/lib/enrichment/parallel-pipeline';

type ProgressEvent = {
  type: 'progress' | 'complete' | 'error';
  step?: string;
  message: string;
  data?: any;
};

/**
 * GET /api/enrich/stream/[id]
 * Stream enrichment progress via Server-Sent Events
 * NEW: Uses parallel pipeline for 5-10 second enrichment (vs 30-60 seconds)
 */
export async function GET(
  request: NextRequest,
  segmentData: { params: Promise<{ id: string }> }
) {
  const { id: contactId } = await segmentData.params;

  // Verify authentication
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Verify contact belongs to user
  const { data: contactCheck } = await supabase
    .from('contacts')
    .select('id, user_id')
    .eq('id', contactId)
    .eq('user_id', user.id)
    .single();

  if (!contactCheck) {
    return new Response('Contact not found', { status: 404 });
  }

  // Create SSE stream
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Helper to send events
      const sendEvent = (event: ProgressEvent) => {
        const data = `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`;
        controller.enqueue(encoder.encode(data));
      };

      try {
        sendEvent({
          type: 'progress',
          step: 'start',
          message: 'Starting enrichment pipeline...',
        });

        // Run parallel enrichment with progress callback
        const result = await enrichContactParallel(contactId, (phase, message, data) => {
          // Stream progress updates in real-time
          sendEvent({
            type: 'progress',
            step: phase,
            message,
            data,
          });
        });

        if (result.success) {
          // Send completion event with summary
          sendEvent({
            type: 'complete',
            message: 'Enrichment complete!',
            data: {
              contactId,
              linkedInUrl: result.linkedInUrl,
              companyWebsite: result.companyWebsite,
              hasNews: result.recentNews.length > 0,
              hasSummary: !!result.aiSummary,
              icebreakerCount: result.icebreakers.length,
              // NEW: Deep research data
              hasPerplexityData: !!result.perplexityData?.company_description,
              hasSocialProfiles: !!(result.socialProfiles?.twitter || result.socialProfiles?.instagram),
              hasReputation: !!result.reputationScore,
            },
          });
        } else {
          sendEvent({
            type: 'error',
            message: result.error || 'Enrichment failed',
          });
        }

        controller.close();
      } catch (error) {
        console.error('SSE enrichment error:', error);

        sendEvent({
          type: 'error',
          message: error instanceof Error ? error.message : 'Enrichment failed',
        });

        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable buffering for Nginx
    },
  });
}
