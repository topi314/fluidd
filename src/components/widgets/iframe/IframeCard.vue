<template>
  <collapsable-card
    :title="title"
    icon="$openInNew"
    :lazy="false"
    draggable
    :layout-path="layoutPath"
  >
    <template #layout-actions>
      <app-btn
        icon
        small
        :aria-label="$t('app.general.btn.remove')"
        @mousedown.stop
        @click.stop="$emit('delete', config.id)"
      >
        <v-icon small>
          $delete
        </v-icon>
      </app-btn>
    </template>

    <template #menu>
      <app-btn-collapse-group>
        <app-btn
          small
          @click="$emit('edit', config)"
        >
          <v-icon
            small
            left
          >
            $pencil
          </v-icon>
          {{ $t('app.general.btn.edit') }}
        </app-btn>
        <app-btn
          small
          @click="$emit('delete', config.id)"
        >
          <v-icon
            small
            left
          >
            $delete
          </v-icon>
          {{ $t('app.general.btn.remove') }}
        </app-btn>
      </app-btn-collapse-group>
    </template>

    <iframe
      v-if="src"
      class="iframe-tile"
      :style="{ height: `${height}px` }"
      :src="src"
      referrerpolicy="no-referrer"
      :sandbox="sandbox"
    />

    <v-card-text
      v-else
      class="text-center"
    >
      {{ $t('app.general.msg.iframe_empty') }}
    </v-card-text>
  </collapsable-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import {
  type LayoutConfig,
  IFRAME_CARD_MIN_HEIGHT,
  isIframeCardConfig
} from '@/store/layout/types'
import { iframeHttpUrl } from '@/util/iframe-url'

@Component({})
export default class IframeCard extends Vue {
  sandbox = 'allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox'

  @Prop({ type: Object, required: true })
  readonly config!: LayoutConfig

  get layoutPath (): string {
    return `dashboard.${this.config.id}`
  }

  get src (): string | undefined {
    if (!isIframeCardConfig(this.config)) return undefined
    return iframeHttpUrl(this.config.url)
  }

  get height (): number {
    if (!isIframeCardConfig(this.config)) return IFRAME_CARD_MIN_HEIGHT
    return Math.max(this.config.height, IFRAME_CARD_MIN_HEIGHT)
  }

  get title (): string {
    if (isIframeCardConfig(this.config) && this.config.title) return this.config.title

    if (this.src) {
      try {
        return new URL(this.src).host
      } catch {
        // src is already a parsed absolute URL
      }
    }

    return this.$t('app.general.title.iframe').toString()
  }
}
</script>

<style lang="scss" scoped>
.iframe-tile {
  border: none;
  display: block;
  width: 100%;
}
</style>
