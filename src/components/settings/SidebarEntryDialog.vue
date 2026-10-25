<template>
  <app-dialog
    v-model="open"
    :title="dialogTitle"
    max-width="480"
    @save="handleSave"
  >
    <v-card-text>
      <v-text-field
        v-model="entry.title"
        filled
        hide-details="auto"
        class="mb-4"
        :label="$t('app.setting.label.title')"
        :rules="[
          $rules.required
        ]"
      />

      <v-text-field
        v-model="entry.url"
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

      <v-select
        v-model="entry.type"
        filled
        dense
        hide-details="auto"
        class="mb-4"
        :label="$t('app.setting.label.type')"
        :items="typeItems"
        :rules="[
          $rules.required
        ]"
      />

      <v-autocomplete
        v-model="entry.icon"
        filled
        dense
        hide-details="auto"
        class="mb-4"
        :label="$t('app.setting.label.icon')"
        :items="iconItems"
        :rules="[
          $rules.required
        ]"
      >
        <template #item="{ item }">
          <v-icon
            dense
            color="primary"
          >
            ${{ item.text }}
          </v-icon>
          <span class="ml-2">{{ item.text }}</span>
        </template>
        <template #selection="{ item }">
          <v-icon
            dense
            color="primary"
          >
            ${{ item.text }}
          </v-icon>
          <span class="ml-2">{{ item.text }}</span>
        </template>
      </v-autocomplete>

      <v-select
        v-model="entry.after"
        filled
        dense
        hide-details="auto"
        :label="$t('app.setting.label.sidebar_position')"
        :items="positionItems"
        :rules="[
          $rules.required
        ]"
      />
    </v-card-text>
  </app-dialog>
</template>

<script lang="ts">
import { Component, Prop, VModel, Vue } from 'vue-property-decorator'
import { Icons } from '@/globals'
import type { SidebarEntry } from '@/store/config/types'
import { iframeHttpUrl } from '@/util/iframe-url'
import { SIDEBAR_POSITIONS, sidebarPosition } from '@/util/sidebar-entry'

@Component({})
export default class SidebarEntryDialog extends Vue {
  @VModel({ type: Boolean })
  open?: boolean

  @Prop({ type: Object, required: true })
  readonly entry!: SidebarEntry

  get dialogTitle () {
    return this.entry.id
      ? this.$t('app.general.title.edit_sidebar_entry')
      : this.$t('app.general.title.add_sidebar_entry')
  }

  get typeItems () {
    return [
      { text: this.$t('app.setting.sidebar_type.link'), value: 'link' },
      { text: this.$t('app.setting.sidebar_type.page'), value: 'page' }
    ]
  }

  get iconItems () {
    return Object.keys(Icons)
      .sort()
      .map(icon => ({ text: icon, value: icon }))
  }

  get positionItems () {
    return SIDEBAR_POSITIONS.map(position => ({
      text: this.positionText(position),
      value: position
    }))
  }

  positionText (position: string) {
    const after = sidebarPosition(position)
    if (after === 'start') return this.$t('app.setting.sidebar_position.start').toString()

    return this.$t('app.setting.sidebar_position.below', {
      name: this.$t(`app.general.title.${after}`)
    }).toString()
  }

  get urlRule () {
    return (value: string) => (
      iframeHttpUrl(value) != null || this.$t('app.general.simple_form.error.invalid_url')
    )
  }

  handleSave () {
    const url = iframeHttpUrl(this.entry.url)
    if (!url) return

    this.entry.url = url
    this.entry.title = this.entry.title.trim()
    this.entry.icon = this.entry.icon || 'openInNew'
    this.entry.after = sidebarPosition(this.entry.after)
    this.$emit('save', this.entry)
    this.open = false
  }
}
</script>
