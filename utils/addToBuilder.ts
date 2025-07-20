import { supabase } from '~/lib/supabase';

export const addToBuilder = async (
  userId: string,
  partType: string,
  partId: string
) => {
  const { data: builderData, error: builderError } = await supabase
    .from('builder')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (builderError || !builderData) {
    throw new Error('Builder not found for user');
  }

  const builderId = builderData.id;

  const { error } = await supabase.from('builder_parts').upsert(
    {
      builder_id: builderId,
      part_type: partType,
      part_id: partId,
    },
    {
      onConflict: 'builder_id,part_type',
    }
  );

  if (error) {
    throw new Error('Failed to add part to builder');
  }
};
