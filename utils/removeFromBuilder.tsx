import { supabase } from '~/lib/supabase';

export const removeFromBuilder = async (userId: string, partType: string) => {
  const { data: builderData, error: builderError } = await supabase
    .from('builder')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (builderError || !builderData) {
    throw new Error('Builder not found for user');
  }

  const builderId = builderData.id;

  const { error } = await supabase
    .from('builder_parts')
    .delete()
    .eq('builder_id', builderId)
    .eq('part_type', partType);

  if (error) {
    throw new Error('Failed to remove part from builder');
  }
};
