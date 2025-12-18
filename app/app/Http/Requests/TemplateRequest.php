<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TemplateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        if ($this->webhook_id === 'none') {
            $this->merge([
                'webhook_id' => null,
            ]);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'category' => 'required|string|max:50',
            'content' => 'required|array',
            'content.content' => 'nullable|string|max:2000',
            'content.embeds' => 'nullable|array|max:10',
            'content.embeds.*.title' => 'nullable|string|max:256',
            'content.embeds.*.description' => 'nullable|string|max:4096',
            'content.embeds.*.color' => 'nullable|integer',
            'content.embeds.*.url' => 'nullable|url',
            'content.embeds.*.timestamp' => 'nullable|boolean',
            'content.embeds.*.footer' => 'nullable|array',
            'content.embeds.*.footer.text' => 'nullable|string|max:2048',
            'content.embeds.*.footer.icon_url' => 'nullable|url',
            'content.embeds.*.image' => 'nullable|array',
            'content.embeds.*.image.url' => 'nullable|url',
            'content.embeds.*.thumbnail' => 'nullable|array',
            'content.embeds.*.thumbnail.url' => 'nullable|url',
            'content.embeds.*.author' => 'nullable|array',
            'content.embeds.*.author.name' => 'nullable|string|max:256',
            'content.embeds.*.author.url' => 'nullable|url',
            'content.embeds.*.author.icon_url' => 'nullable|url',
            'content.embeds.*.fields' => 'nullable|array|max:25',
            'content.embeds.*.fields.*.name' => 'required|string|max:256',
            'content.embeds.*.fields.*.value' => 'required|string|max:1024',
            'content.embeds.*.fields.*.inline' => 'nullable|boolean',
            'webhook_id' => 'nullable|exists:webhooks,id',
            'is_shared' => 'boolean',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Template name is required.',
            'category.required' => 'Please select a category for your template.',
            'category.in' => 'Invalid category selected.',
            'content.required' => 'Template content cannot be empty.',
            'webhook_id.exists' => 'Selected webhook does not exist.',
        ];
    }
}
