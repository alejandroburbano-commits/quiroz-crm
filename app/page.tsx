await createLead({
  ...formData,
  assigned_to: formData.assigned_to || null,
  notes: formData.notes || '',
  tags: formData.tags || []
})