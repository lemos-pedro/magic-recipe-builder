import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { getPlanByProductId, Plan, STRIPE_PLANS } from '@/lib/stripe-plans';

interface SubscriptionState {
  isLoading: boolean;
  subscribed: boolean;
  plan: Plan | null;
  subscriptionEnd: string | null;
  error: string | null;
}

export function useSubscription() {
  const { user } = useAuth();
  const [state, setState] = useState<SubscriptionState>({
    isLoading: true,
    subscribed: false,
    plan: null,
    subscriptionEnd: null,
    error: null,
  });

  const checkSubscription = useCallback(async () => {
    if (!user) {
      setState({
        isLoading: false,
        subscribed: false,
        plan: null,
        subscriptionEnd: null,
        error: null,
      });
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) throw error;
      
      const plan = data.product_id ? getPlanByProductId(data.product_id) : null;
      
      setState({
        isLoading: false,
        subscribed: data.subscribed,
        plan,
        subscriptionEnd: data.subscription_end,
        error: null,
      });
    } catch (error) {
      console.error('Error checking subscription:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to check subscription',
      }));
    }
  }, [user]);

  useEffect(() => {
    checkSubscription();
    
    // Auto-refresh every minute
    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [checkSubscription]);

  const createCheckout = async (priceId: string, quantity = 1) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId, quantity },
      });
      
      if (error) throw error;
      if (data.url) {
        window.open(data.url, '_blank');
      }
      return data;
    } catch (error) {
      console.error('Error creating checkout:', error);
      throw error;
    }
  };

  const openCustomerPortal = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      if (data.url) {
        window.open(data.url, '_blank');
      }
      return data;
    } catch (error) {
      console.error('Error opening customer portal:', error);
      throw error;
    }
  };

  return {
    ...state,
    checkSubscription,
    createCheckout,
    openCustomerPortal,
    plans: STRIPE_PLANS,
  };
}
