export const StepHeading = ({
  title,
  description,
}: {
  title: string
  description?: string
}) => (
  <div className='space-y-2'>
    <h2 className='text-foreground text-2xl font-semibold tracking-tight'>
      {title}
    </h2>
    {description && (
      <p className='text-muted-foreground text-[15px] leading-relaxed'>
        {description}
      </p>
    )}
  </div>
)