<template>
  <div>
    <iframe
      v-if="src"
      class="sidebar-page"
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
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { isSidebarEntry } from '@/store/config/types'
import { iframeHttpUrl } from '@/util/iframe-url'

@Component({})
export default class SidebarPage extends Vue {
  sandbox = 'allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox'

  get src (): string | undefined {
    const entry = this.$typedState.config.uiSettings.sidebar.entries
      .find(item => (
        isSidebarEntry(item) &&
        item.id === this.$route.params.entryId &&
        item.type === 'page'
      ))

    if (!entry) return undefined

    return iframeHttpUrl(entry.url)
  }
}
</script>

<style lang="scss" scoped>
.sidebar-page {
  border: none;
  display: block;
  width: 100%;
  height: calc(100vh - 88px);
}
</style>
