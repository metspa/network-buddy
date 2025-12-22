import { Purchases, PurchasesPackage, LOG_LEVEL } from '@revenuecat/purchases-capacitor';
// Capacitor plugin import only

// API Key from environment variables
const REVENUECAT_API_KEY = process.env.NEXT_PUBLIC_REVENUECAT_IOS_API_KEY || '';

if (!REVENUECAT_API_KEY) {
    console.warn('RevenueCat API Key is missing! Check your .env.local file.');
}

export class RevenueCatService {
    static async initialize() {
        try {
            await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
            await Purchases.configure({ apiKey: REVENUECAT_API_KEY });
            console.log('RevenueCat configured');
        } catch (error) {
            console.error('Failed to configure RevenueCat:', error);
        }
    }

    static async getOfferings() {
        try {
            const offerings = await Purchases.getOfferings();
            if (offerings.current !== null && offerings.current.availablePackages.length !== 0) {
                return offerings.current.availablePackages;
            }
            return [];
        } catch (error) {
            console.error('Error getting offerings:', error);
            return [];
        }
    }

    static async purchasePackage(pkg: PurchasesPackage) {
        try {
            const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });
            return { success: true, customerInfo };
        } catch (error: any) {
            if (error.userCancelled) {
                return { success: false, cancelled: true };
            }
            console.error('Error purchasing package:', error);
            return { success: false, error: error.message };
        }
    }

    static async restorePurchases() {
        try {
            const customerInfo = await Purchases.restorePurchases();
            return { success: true, customerInfo };
        } catch (error: any) {
            console.error('Error restoring purchases:', error);
            return { success: false, error: error.message };
        }
    }
}
