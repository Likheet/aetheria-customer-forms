import { supabase } from '../lib/supabase';

export interface FeedbackData {
  appointmentId: string;
  customerName: string;
  services: string[];
  staffMember: string;
  serviceDuration: string;
  overallRating: number;
  serviceQuality: number;
  staffRating: number;
  cleanliness: number;
  valueForMoney: number;
  textFeedback: string;
  additionalComments: string;
  recommendationScore: number;
  wouldReturn: string;
}

export const submitFeedback = async (feedbackData: FeedbackData): Promise<{ success: boolean; error?: string; data?: any }> => {
  try {
    const feedbackRecord = {
      appointment_id: feedbackData.appointmentId,
      customer_name: feedbackData.customerName,
      services: feedbackData.services,
      staff_member: feedbackData.staffMember,
      service_duration: feedbackData.serviceDuration,
      overall_rating: feedbackData.overallRating,
      service_quality: feedbackData.serviceQuality,
      staff_rating: feedbackData.staffRating,
      cleanliness: feedbackData.cleanliness,
      value_for_money: feedbackData.valueForMoney,
      text_feedback: feedbackData.textFeedback,
      additional_comments: feedbackData.additionalComments,
      recommendation_score: feedbackData.recommendationScore,
      would_return: feedbackData.wouldReturn,
      submitted_by_staff_id: 'staff-tablet', // Could be dynamic in the future
      submission_device: 'tablet'
    };

    console.log('Submitting feedback:', feedbackRecord);

    const { data, error } = await supabase
      .from('feedback')
      .insert([feedbackRecord])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return { success: false, error: error.message };
    }

    console.log('Feedback submitted successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
};

export const getFeedback = async (): Promise<{ success: boolean; data?: any[]; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
};

export const getFeedbackByAppointmentId = async (appointmentId: string): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .eq('appointment_id', appointmentId)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
};