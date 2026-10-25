<template>
  <v-navigation-drawer
    v-model="open"
    :color="$vuetify.theme.currentTheme.drawer"
    :mini-variant="!showSubNavigation"
    :floating="!showSubNavigation"
    clipped
    app
  >
    <v-row
      class="fill-height"
      no-gutters
    >
      <v-navigation-drawer
        :color="$vuetify.theme.currentTheme.drawer"
        mini-variant
        :value="open"
        class="pb-16 pb-sm-0"
      >
        <div
          v-if="isMobileViewport"
          :style="`height: ${$globals.HEADER_HEIGHT}px;`"
          class="app-icon"
        >
          <router-link :to="{ name: 'home' }">
            <app-icon />
          </router-link>
        </div>

        <div
          v-if="socketReady"
          class="nav-items"
        >
          <template v-for="item in navItems">
            <app-nav-item
              v-if="item.kind === 'entry'"
              :key="item.key"
              :icon="item.icon"
              :href="item.entry.type === 'link' ? httpUrl(item.entry.url) : undefined"
              :to="item.entry.type === 'page' ? pageRoute(item.entry.id) : undefined"
              :exact="item.entry.type === 'page'"
            >
              {{ item.entry.title }}
            </app-nav-item>
            <app-nav-item
              v-else
              :key="item.key"
              :icon="item.icon"
              :exact="item.exact"
              :to="item.to"
            >
              {{ item.title }}
            </app-nav-item>
          </template>
        </div>

        <template
          v-if="socketReady && !isMobileViewport && canEditLayout"
          #append
        >
          <v-tooltip right>
            <template #activator="{ attrs, on }">
              <app-btn
                icon
                large
                :color="layoutMode ? 'primary' : undefined"
                style="margin: 6px"
                v-bind="attrs"
                v-on="on"
                @click="layoutMode = !layoutMode"
              >
                <v-icon>$apps</v-icon>
              </app-btn>
            </template>
            <span>
              {{ $t('app.general.btn.adjust_layout') }}
            </span>
          </v-tooltip>
        </template>
      </v-navigation-drawer>

      <router-view
        v-if="showSubNavigation"
        name="navigation"
      />
    </v-row>
  </v-navigation-drawer>
</template>

<script lang="ts">
import { Component, Mixins, VModel } from 'vue-property-decorator'

import StateMixin from '@/mixins/state'
import BrowserMixin from '@/mixins/browser'
import { isSidebarEntry, type SidebarEntry } from '@/store/config/types'
import { iframeHttpUrl } from '@/util/iframe-url'
import { sidebarIconName, sidebarInsertAfter } from '@/util/sidebar-entry'

@Component({})
export default class AppNavDrawer extends Mixins(StateMixin, BrowserMixin) {
  @VModel({ type: Boolean })
  open?: boolean

  get supportsHistory (): boolean {
    return this.$typedGetters['server/componentSupport']('history')
  }

  get supportsTimelapse (): boolean {
    return this.$typedGetters['server/componentSupport']('timelapse')
  }

  get enableDiagnostics (): boolean {
    return this.$typedState.config.uiSettings.general.enableDiagnostics
  }

  get hasSubNavigation () {
    return this.$route.meta?.hasSubNavigation ?? false
  }

  get showSubNavigation () {
    return this.hasSubNavigation && this.socketReady
  }

  get sidebarEntries (): SidebarEntry[] {
    return this.$typedState.config.uiSettings.sidebar.entries
      .filter(isSidebarEntry)
  }

  get navItems () {
    const item = (
      id: string,
      icon: string,
      visible: boolean,
      exact = false
    ) => ({
      id,
      icon,
      to: id,
      exact,
      title: this.$t(`app.general.title.${id}`).toString(),
      visible
    })
    const builtins = [
      item('home', '$dash', true, true),
      item('console', '$console', true),
      item('gcode_preview', '$cubeScan', true),
      item('jobs', '$files', true),
      item('history', '$history', this.supportsHistory),
      item('timelapse', '$video', this.supportsTimelapse),
      item('tune', '$tune', true),
      item('diagnostics', '$chart', this.enableDiagnostics),
      item('configure', '$codeJson', true),
      item('system', '$desktopTower', true),
      item('settings', '$cog', true)
    ]
    const visible = builtins.filter(item => item.visible).map(item => item.id)
    const placed = (after: string) => this.sidebarEntries.filter(entry => (
      sidebarInsertAfter(entry.after, visible) === after
    ))
    const entryItem = (entry: SidebarEntry) => ({
      kind: 'entry' as const,
      key: `entry:${entry.id}`,
      icon: `$${sidebarIconName(entry)}`,
      entry
    })

    return [
      ...placed('start').map(entryItem),
      ...builtins.flatMap(item => (
        item.visible
          ? [
              {
                kind: 'builtin' as const,
                key: `builtin:${item.id}`,
                icon: item.icon,
                to: item.to,
                exact: item.exact,
                title: item.title
              },
              ...placed(item.id).map(entryItem)
            ]
          : []
      ))
    ]
  }

  httpUrl (url: string) {
    return iframeHttpUrl(url)
  }

  pageRoute (entryId: string) {
    return {
      name: 'sidebar_page',
      params: { entryId }
    }
  }

  get canEditLayout () {
    return this.$route.meta?.dashboard ?? false
  }

  get layoutMode (): boolean {
    return this.$typedState.config.layoutMode
  }

  set layoutMode (val: boolean) {
    this.$typedCommit('config/setLayoutMode', val)
  }
}
</script>

<style lang="scss" scoped>
  .app-icon {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  :deep(.v-navigation-drawer.no-subnav > .v-navigation-drawer__border) {
     display: none;
  }
</style>
