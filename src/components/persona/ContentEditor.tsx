'use client';

import { useState, useCallback } from 'react';
import { Row, Column, Text, Button } from '@/components/zen';
import { useApi } from '@/components/hooks/useApi';
import { useQueryClient } from '@tanstack/react-query';
import styles from './ContentEditor.module.css';

interface ContentVariant {
  id: string;
  persona: string;
  selector: string;
  content: string;
  contentType: 'text' | 'html' | 'class' | 'attribute';
  pagePath?: string;
  isActive: boolean;
  name?: string;
}

interface ContentEditorProps {
  websiteId: string;
}

const PERSONA_OPTIONS = [
  { value: 'value-seeker', label: 'Value Seeker', icon: '💰', color: '#10B981' },
  { value: 'solution-seeker', label: 'Solution Seeker', icon: '🔧', color: '#3B82F6' },
  { value: 'trust-seeker', label: 'Trust Seeker', icon: '⭐', color: '#8B5CF6' },
  { value: 'ready-buyer', label: 'Ready Buyer', icon: '🎯', color: '#EF4444' },
  { value: 'explorer', label: 'Explorer', icon: '🧭', color: '#6B7280' },
];

const CONTENT_TYPE_OPTIONS = [
  { value: 'text', label: 'Text', description: 'Replace text content' },
  { value: 'html', label: 'HTML', description: 'Replace inner HTML' },
  { value: 'class', label: 'CSS Class', description: 'Add/modify CSS classes' },
  { value: 'attribute', label: 'Attribute', description: 'Set HTML attribute' },
];

export function ContentEditor({ websiteId }: ContentEditorProps) {
  const { get, post, patch, del, useQuery } = useApi();
  const queryClient = useQueryClient();
  const queryKey = ['content-variants', websiteId];

  const {
    data,
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey,
    queryFn: () => get(`/websites/${websiteId}/content-variants`),
  });

  const variants: ContentVariant[] = data?.variants || [];

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<ContentVariant>>({
    persona: 'value-seeker',
    contentType: 'text',
    isActive: true,
  });

  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  const handleCreate = () => {
    setIsCreating(true);
    setFormData({
      persona: 'value-seeker',
      contentType: 'text',
      isActive: true,
    });
  };

  const handleEdit = (variant: ContentVariant) => {
    setEditingId(variant.id);
    setFormData(variant);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    setFormData({});
  };

  const handleSave = async () => {
    if (!formData.selector || !formData.content) return;

    setIsSaving(true);
    setError(null);
    try {
      if (isCreating) {
        await post(`/websites/${websiteId}/content-variants`, formData);
      } else if (editingId) {
        await patch(`/websites/${websiteId}/content-variants/${editingId}`, formData);
      }
      refetch();
      handleCancel();
    } catch {
      setError('Failed to save content variant. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (variantId: string) => {
    if (!confirm('Are you sure you want to delete this content variant?')) return;

    setError(null);
    try {
      await del(`/websites/${websiteId}/content-variants/${variantId}`);
      refetch();
    } catch {
      setError('Failed to delete content variant. Please try again.');
    }
  };

  const handleToggleActive = async (variant: ContentVariant) => {
    setError(null);
    try {
      await patch(`/websites/${websiteId}/content-variants/${variant.id}`, {
        isActive: !variant.isActive,
      });
      refetch();
    } catch {
      setError('Failed to update variant status. Please try again.');
    }
  };

  if (isLoading) {
    return <ContentEditorSkeleton />;
  }

  if (queryError) {
    return (
      <Column gap="4" alignItems="center" className={styles.emptyState}>
        <span className={styles.emptyIcon}>⚠️</span>
        <Text size="5" weight="bold">
          Failed to load content variants
        </Text>
        <Text color="muted">Please try refreshing the page.</Text>
      </Column>
    );
  }

  return (
    <Column gap="6" className={styles.editor}>
      {/* Error Message */}
      {error && (
        <div className={styles.errorBanner}>
          <Text color="error">{error}</Text>
          <button onClick={() => setError(null)} className={styles.errorClose}>
            ×
          </button>
        </div>
      )}

      {/* Header */}
      <Row justifyContent="space-between" alignItems="center">
        <Column gap="1">
          <Text size="6" weight="bold">
            Dynamic Content
          </Text>
          <Text color="muted">Personalize your website content based on visitor personas</Text>
        </Column>
        <Button variant="primary" onClick={handleCreate}>
          + Create Variant
        </Button>
      </Row>

      {/* Create/Edit Form */}
      {(isCreating || editingId) && (
        <div className={styles.formCard}>
          <Column gap="5">
            <Text size="5" weight="bold">
              {isCreating ? 'Create Content Variant' : 'Edit Content Variant'}
            </Text>

            {/* Variant Name */}
            <Column gap="2">
              <Text size="2" weight="bold" color="muted">
                VARIANT NAME
              </Text>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g., Homepage Hero for Value Seekers"
                value={formData.name || ''}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </Column>

            {/* Persona Selection */}
            <Column gap="2">
              <Text size="2" weight="bold" color="muted">
                TARGET PERSONA
              </Text>
              <Row gap="2" wrap="wrap">
                {PERSONA_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    className={`${styles.personaChip} ${formData.persona === option.value ? styles.personaChipActive : ''}`}
                    style={
                      formData.persona === option.value
                        ? { borderColor: option.color, backgroundColor: `${option.color}15` }
                        : {}
                    }
                    onClick={() => setFormData({ ...formData, persona: option.value })}
                  >
                    <span>{option.icon}</span>
                    <span>{option.label}</span>
                  </button>
                ))}
              </Row>
            </Column>

            {/* Page Path */}
            <Column gap="2">
              <Text size="2" weight="bold" color="muted">
                PAGE PATH (OPTIONAL)
              </Text>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g., /pricing or leave empty for all pages"
                value={formData.pagePath || ''}
                onChange={e => setFormData({ ...formData, pagePath: e.target.value })}
              />
              <Text size="1" color="muted">
                Leave empty to apply on all pages
              </Text>
            </Column>

            {/* CSS Selector */}
            <Column gap="2">
              <Text size="2" weight="bold" color="muted">
                CSS SELECTOR
              </Text>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g., .hero-title, #cta-button, [data-personalize]"
                value={formData.selector || ''}
                onChange={e => setFormData({ ...formData, selector: e.target.value })}
              />
              <Text size="1" color="muted">
                Use CSS selectors to target elements (class, id, or attribute)
              </Text>
            </Column>

            {/* Content Type */}
            <Column gap="2">
              <Text size="2" weight="bold" color="muted">
                CONTENT TYPE
              </Text>
              <Row gap="2" wrap="wrap">
                {CONTENT_TYPE_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    className={`${styles.typeChip} ${formData.contentType === option.value ? styles.typeChipActive : ''}`}
                    onClick={() =>
                      setFormData({
                        ...formData,
                        contentType: option.value as ContentVariant['contentType'],
                      })
                    }
                  >
                    <span className={styles.typeLabel}>{option.label}</span>
                    <span className={styles.typeDesc}>{option.description}</span>
                  </button>
                ))}
              </Row>
            </Column>

            {/* Content */}
            <Column gap="2">
              <Text size="2" weight="bold" color="muted">
                CONTENT
              </Text>
              <textarea
                className={styles.textarea}
                placeholder={
                  formData.contentType === 'text'
                    ? 'Enter the text content...'
                    : formData.contentType === 'html'
                      ? '<div class="offer">Special offer just for you!</div>'
                      : formData.contentType === 'class'
                        ? 'highlight urgent-cta'
                        : 'data-variant=value-seeker'
                }
                rows={4}
                value={formData.content || ''}
                onChange={e => setFormData({ ...formData, content: e.target.value })}
              />
            </Column>

            {/* Preview */}
            <Column gap="2">
              <Text size="2" weight="bold" color="muted">
                PREVIEW
              </Text>
              <div className={styles.preview}>
                <div className={styles.previewHeader}>
                  <span className={styles.previewDot} style={{ background: '#EF4444' }} />
                  <span className={styles.previewDot} style={{ background: '#F59E0B' }} />
                  <span className={styles.previewDot} style={{ background: '#10B981' }} />
                  <span className={styles.previewUrl}>{formData.pagePath || '/'}</span>
                </div>
                <div className={styles.previewContent}>
                  <div className={styles.previewElement}>
                    <Text size="1" color="muted">
                      {formData.selector || '[element]'}
                    </Text>
                    <div className={styles.previewText}>
                      {formData.content || 'Your personalized content will appear here'}
                    </div>
                  </div>
                </div>
              </div>
            </Column>

            {/* Actions */}
            <Row gap="3" justifyContent="flex-end">
              <Button variant="outline" onClick={handleCancel} isDisabled={isSaving}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                isDisabled={isSaving || !formData.selector || !formData.content}
              >
                {isSaving ? 'Saving...' : isCreating ? 'Create Variant' : 'Save Changes'}
              </Button>
            </Row>
          </Column>
        </div>
      )}

      {/* Existing Variants List */}
      {variants.length > 0 && !isCreating && !editingId && (
        <Column gap="3">
          <Text size="4" weight="bold">
            Content Variants ({variants.length})
          </Text>
          {variants.map(variant => {
            const personaConfig = PERSONA_OPTIONS.find(p => p.value === variant.persona);
            return (
              <div
                key={variant.id}
                className={styles.variantCard}
                style={{ borderLeftColor: personaConfig?.color }}
              >
                <Row justifyContent="space-between" alignItems="flex-start">
                  <Row gap="3" alignItems="center">
                    <span className={styles.variantIcon}>{personaConfig?.icon}</span>
                    <Column gap="1">
                      <Text weight="bold">{variant.name || 'Unnamed Variant'}</Text>
                      <Row gap="2">
                        <span className={styles.variantTag}>{variant.contentType}</span>
                        <Text size="2" color="muted">
                          {variant.selector}
                        </Text>
                      </Row>
                    </Column>
                  </Row>
                  <Row gap="2">
                    <button
                      className={`${styles.statusBadge} ${variant.isActive ? styles.statusActive : styles.statusInactive}`}
                      onClick={() => handleToggleActive(variant)}
                    >
                      {variant.isActive ? 'Active' : 'Inactive'}
                    </button>
                    <Button variant="quiet" onClick={() => handleEdit(variant)}>
                      Edit
                    </Button>
                    <Button variant="quiet" onClick={() => handleDelete(variant.id)}>
                      Delete
                    </Button>
                  </Row>
                </Row>
                <div className={styles.variantPreview}>
                  <Text size="2" color="muted">
                    {variant.content.substring(0, 100)}
                    {variant.content.length > 100 ? '...' : ''}
                  </Text>
                </div>
              </div>
            );
          })}
        </Column>
      )}

      {/* Empty State */}
      {variants.length === 0 && !isCreating && (
        <Column gap="4" alignItems="center" className={styles.emptyState}>
          <span className={styles.emptyIcon}>✨</span>
          <Text size="5" weight="bold">
            No content variants yet
          </Text>
          <Text color="muted" style={{ textAlign: 'center', maxWidth: 400 }}>
            Create personalized content that automatically changes based on visitor personas.
            Increase conversions by showing the right message to the right audience.
          </Text>
          <Button variant="primary" onClick={handleCreate}>
            Create Your First Variant
          </Button>
        </Column>
      )}
    </Column>
  );
}

function ContentEditorSkeleton() {
  return (
    <Column gap="6" className={styles.editor}>
      <Row justifyContent="space-between" alignItems="center">
        <Column gap="1">
          <div className={styles.skeletonTitle} />
          <div className={styles.skeletonText} />
        </Column>
        <div className={styles.skeletonButton} />
      </Row>
      <div className={styles.skeletonCard} />
      <div className={styles.skeletonCard} />
    </Column>
  );
}
