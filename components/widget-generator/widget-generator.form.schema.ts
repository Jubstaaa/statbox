import { z } from 'zod'

export const widgetGeneratorFormSchema = z.object({
    name: z.string().trim().min(1, 'Game Name is required'),
    tag: z
        .string()
        .trim()
        .transform(value => value.replace(/^#/, ''))
        .pipe(z.string().min(1, 'Tag is required').max(5, 'Tag is too long')),
})

export type WidgetGeneratorFormValues = z.output<
    typeof widgetGeneratorFormSchema
>

export type WidgetGeneratorFormErrors = Partial<
    Record<keyof WidgetGeneratorFormValues, string>
>
