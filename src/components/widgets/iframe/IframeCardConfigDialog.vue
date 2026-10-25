<template>
  <app-dialog
    v-model="open"
    :title="config.id ? $t('app.general.title.edit_iframe') : $t('app.general.title.add_iframe')"
    max-width="480"
    @save="handleSave"
  >
    <v-card-text>
      <v-text-field
        v-model="config.title"
        filled
        hide-details="auto"
        class="mb-4"
        :label="$t('app.setting.label.title')"
      />

      <v-text-field
        v-model="config.url"
        filled
        spellcheck="false"
        hide-details="auto"
        class="mb-4"
        :label="$t('app.general.label.iframe_url')"
        :rules="[
          $rules.required,
          urlRule
        ]"
      />

      <v-text-field
        v-model.number="config.height"
        type="number"
        filled
        hide-details="auto"
        :min="minHeight"
        :label="$t('app.setting.label.height')"
        :rules="[
          heightRule
        ]"
      />
    </v-card-text>

    <template #actions>
      <app-btn
        v-if="config.id"
        color="error"
        text
        type="button"
        @click="handleDelete"
      >
        {{ $t('app.general.btn.remove') }}
      </app-btn>

      <v-spacer />

      <app-btn
        color="warning"
        text
        type="button"
        @click="open = false"
      >
        {{ $t('app.general.btn.cancel') }}
      </app-btn>
      <app-btn
        color="primary"
        type="submit"
      >
        {{ config.id ? $t('app.general.btn.save') : $t('app.general.btn.add') }}
      </app-btn>
    </template>
  </app-dialog>
</template>

<script lang="ts">
import { Component, Prop, VModel, Vue } from 'vue-property-decorator'
import { type IframeCardConfig, IFRAME_CARD_MIN_HEIGHT } from '@/store/layout/types'
import { iframeHttpUrl } from '@/util/iframe-url'

@Component({})
export default class IframeCardConfigDialog extends Vue {
  @VModel({ type: Boolean })
  open?: boolean

  @Prop({ type: Object, required: true })
  readonly config!: IframeCardConfig

  get minHeight () {
    return IFRAME_CARD_MIN_HEIGHT
  }

  get urlRule () {
    return (value: string) => (
      iframeHttpUrl(value) != null || this.$t('app.general.simple_form.error.invalid_url')
    )
  }

  get heightRule () {
    return (value: unknown) => {
      const height = typeof value === 'number' ? value : Number(value)

      return (
        Number.isFinite(height) && height >= IFRAME_CARD_MIN_HEIGHT
      ) || this.$t('app.general.msg.iframe_height')
    }
  }

  handleSave () {
    const url = iframeHttpUrl(this.config.url)
    if (!url) return

    this.config.url = url
    this.$emit('save', this.config)
    this.open = false
  }

  handleDelete () {
    this.$emit('delete', this.config.id)
    this.open = false
  }
}
</script>
