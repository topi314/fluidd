<template>
  <div>
    <v-subheader id="sidebar">
      {{ $t('app.setting.title.sidebar') }}
    </v-subheader>
    <v-card
      :elevation="5"
      dense
      class="mb-4"
    >
      <app-setting>
        <app-btn
          outlined
          small
          color="primary"
          @click="handleAdd"
        >
          <v-icon
            small
            left
          >
            $plus
          </v-icon>
          {{ $t('app.setting.btn.add_sidebar_entry') }}
        </app-btn>
      </app-setting>

      <template v-for="entry in entries">
        <v-divider :key="`divider-${entry.id}`" />

        <app-setting
          :key="entry.id"
          :title="entry.title"
          :sub-title="entrySummary(entry)"
        >
          <app-btn
            icon
            @click.stop="handleEdit(entry)"
          >
            <v-icon dense>
              $edit
            </v-icon>
          </app-btn>

          <app-btn
            icon
            @click.stop="handleRemove(entry)"
          >
            <v-icon dense>
              $delete
            </v-icon>
          </app-btn>
        </app-setting>
      </template>

      <sidebar-entry-dialog
        v-if="dialog.active"
        v-model="dialog.active"
        :entry="dialog.entry"
        @save="handleSave"
      />
    </v-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { v4 as uuidv4 } from 'uuid'
import SidebarEntryDialog from './SidebarEntryDialog.vue'
import { isSidebarEntry, type SidebarEntry } from '@/store/config/types'
import { sidebarPosition } from '@/util/sidebar-entry'

@Component({
  components: {
    SidebarEntryDialog
  }
})
export default class SidebarSettings extends Vue {
  dialog: { active: boolean, entry: SidebarEntry } = {
    active: false,
    entry: {
      id: '',
      title: '',
      url: '',
      type: 'link',
      icon: 'openInNew',
      after: 'home'
    }
  }

  get entries (): SidebarEntry[] {
    return this.$typedState.config.uiSettings.sidebar.entries
      .filter(isSidebarEntry)
  }

  handleAdd () {
    this.dialog = {
      active: true,
      entry: {
        id: '',
        title: '',
        url: '',
        type: 'link',
        icon: 'openInNew',
        after: 'home'
      }
    }
  }

  handleEdit (entry: SidebarEntry) {
    this.dialog = {
      active: true,
      entry: {
        ...entry,
        icon: entry.icon || (entry.type === 'link' ? 'openInNew' : 'web'),
        after: sidebarPosition(entry.after)
      }
    }
  }

  entrySummary (entry: SidebarEntry) {
    const type = entry.type === 'link'
      ? this.$t('app.setting.sidebar_type.link')
      : this.$t('app.setting.sidebar_type.page')
    const after = sidebarPosition(entry.after)
    const position = after === 'start'
      ? this.$t('app.setting.sidebar_position.start')
      : this.$t('app.setting.sidebar_position.below', {
        name: this.$t(`app.general.title.${after}`)
      })

    return `${type} · ${position}`
  }

  handleSave (entry: SidebarEntry) {
    const entries = this.entries.map(existing => ({ ...existing }))

    if (entry.id === '') {
      entries.push({ ...entry, id: uuidv4() })
    } else {
      const index = entries.findIndex(existing => existing.id === entry.id)
      if (index >= 0) entries.splice(index, 1, { ...entry })
    }

    this.$typedDispatch('config/saveByPath', {
      path: 'uiSettings.sidebar.entries',
      value: entries,
      server: true
    })
  }

  async handleRemove (entry: SidebarEntry) {
    const result = await this.$confirm(
      this.$t('app.general.simple_form.msg.confirm_remove_sidebar_entry', {
        name: entry.title
      }).toString(),
      { title: this.$tc('app.general.label.confirm'), color: 'card-heading', icon: '$error' }
    )

    if (!result) return

    this.$typedDispatch('config/saveByPath', {
      path: 'uiSettings.sidebar.entries',
      value: this.entries.filter(existing => existing.id !== entry.id),
      server: true
    })
  }
}
</script>
