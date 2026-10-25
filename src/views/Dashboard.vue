<template>
  <div>
    <v-row
      v-if="inLayout"
      justify="center"
    >
      <v-col
        cols="12"
        class="d-flex justify-center"
      >
        <app-btn-group>
          <app-btn
            small
            color="primary"
            @click="handleAddCamera"
          >
            <v-icon
              small
              left
            >
              $plus
            </v-icon>
            {{ $t('app.general.title.add_camera_tile') }}
          </app-btn>
          <app-btn
            small
            color="primary"
            @click="handleAddIframe"
          >
            <v-icon
              small
              left
            >
              $plus
            </v-icon>
            {{ $t('app.general.title.add_iframe') }}
          </app-btn>
        </app-btn-group>
      </v-col>
    </v-row>

    <v-row :dense="$vuetify.breakpoint.smAndDown">
      <template v-for="(container, containerIndex) in containers">
        <app-observed-column
          v-if="inLayout || hasCards(container)"
          :key="`container${containerIndex}`"
          cols="12"
          md="6"
          :lg="columnSpan"
          :class="{ 'drag': inLayout }"
        >
          <template #default="{ narrow }">
            <app-draggable
              v-model="containers[containerIndex]"
              class="list-group"
              :options="draggableOptions"
              @end="handleUpdateLayout"
            >
              <template v-for="c in container">
                <component
                  :is="c.type || c.id"
                  v-if="inLayout || (c.enabled && !filtered(c))"
                  :key="c.id"
                  v-bind="cardBindings(c)"
                  :narrow="narrow"
                  class="mb-2 mb-md-4"
                  @edit="handleEditCard"
                  @delete="handleDeleteCard"
                />
              </template>
            </app-draggable>
          </template>
        </app-observed-column>
      </template>
    </v-row>

    <camera-card-config-dialog
      v-if="cameraDialog.active && cameraDialog.card"
      v-model="cameraDialog.active"
      :config="cameraDialog.card"
      @save="handleSaveCard"
    />

    <iframe-card-config-dialog
      v-if="iframeDialog.active && iframeDialog.card"
      v-model="iframeDialog.active"
      :config="iframeDialog.card"
      @save="handleSaveCard"
      @delete="handleDeleteCard"
    />
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Watch } from 'vue-property-decorator'
import { v4 as uuidv4 } from 'uuid'
import StateMixin from '@/mixins/state'
import PrinterStatusCard from '@/components/widgets/status/PrinterStatusCard.vue'
import JobsCard from '@/components/widgets/jobs/JobsCard.vue'
import ToolheadCard from '@/components/widgets/toolhead/ToolheadCard.vue'
import TemperatureCard from '@/components/widgets/thermals/TemperatureCard.vue'
import CameraCard from '@/components/widgets/camera/CameraCard.vue'
import MacrosCard from '@/components/widgets/macros/MacrosCard.vue'
import ConsoleCard from '@/components/widgets/console/ConsoleCard.vue'
import OutputsCard from '@/components/widgets/outputs/OutputsCard.vue'
import PrinterLimitsCard from '@/components/widgets/limits/PrinterLimitsCard.vue'
import RetractCard from '@/components/widgets/retract/RetractCard.vue'
import {
  type CameraCardConfig,
  type IframeCardConfig,
  type LayoutConfig,
  type LayoutContainer,
  isCameraCardConfig,
  isIframeCardConfig
} from '@/store/layout/types'
import { createCameraCardState, createIframeCardState } from '@/store/layout/state'
import BedMeshCard from '@/components/widgets/bedmesh/BedMeshCard.vue'
import GcodePreviewCard from '@/components/widgets/gcode-preview/GcodePreviewCard.vue'
import JobQueueCard from '@/components/widgets/job-queue/JobQueueCard.vue'
import SpoolmanCard from '@/components/widgets/spoolman/SpoolmanCard.vue'
import MmuCard from '@/components/widgets/mmu/MmuCard.vue'
import SensorsCard from '@/components/widgets/sensors/SensorsCard.vue'
import RunoutSensorsCard from '@/components/widgets/runout-sensors/RunoutSensorsCard.vue'
import BeaconCard from '@/components/widgets/beacon/BeaconCard.vue'
import AfcCard from '@/components/widgets/afc/AfcCard.vue'
import IframeCard from '@/components/widgets/iframe/IframeCard.vue'
import CameraCardConfigDialog from '@/components/widgets/camera/CameraCardConfigDialog.vue'
import IframeCardConfigDialog from '@/components/widgets/iframe/IframeCardConfigDialog.vue'
import type Sortable from 'sortablejs'

@Component({
  components: {
    PrinterStatusCard,
    JobsCard,
    ToolheadCard,
    MacrosCard,
    TemperatureCard,
    CameraCard,
    PrinterLimitsCard,
    RetractCard,
    ConsoleCard,
    OutputsCard,
    BedMeshCard,
    GcodePreviewCard,
    JobQueueCard,
    SpoolmanCard,
    MmuCard,
    SensorsCard,
    RunoutSensorsCard,
    BeaconCard,
    AfcCard,
    IframeCard,
    CameraCardConfigDialog,
    IframeCardConfigDialog
  }
})
export default class Dashboard extends Mixins(StateMixin) {
  containers: Array<LayoutConfig[]> = []

  cameraDialog: { active: boolean, card: CameraCardConfig | null } = {
    active: false,
    card: null
  }

  iframeDialog: { active: boolean, card: IframeCardConfig | null } = {
    active: false,
    card: null
  }

  mounted () {
    this.onLayoutChange()
  }

  get columnCount () {
    if (this.inLayout) return 4

    return this.containers.reduce((count, container) => +this.hasCards(container) + count, 0)
  }

  @Watch('columnCount')
  onColumnCount (value: number) {
    this.$typedCommit('config/setContainerColumnCount', value)
  }

  get columnSpan () {
    return 12 / this.columnCount
  }

  get printerSettings (): Klipper.SettingsState {
    return this.$typedGetters['printer/getPrinterSettings']
  }

  get hasCameras (): boolean {
    return this.$typedGetters['webcams/getEnabledWebcams'].length > 0
  }

  get hasHeatersOrTemperatureSensors (): boolean {
    return (
      this.$typedGetters['printer/getHeaters'].length > 0 ||
      this.$typedGetters['printer/getOutputs'](['temperature_fan']).length > 0 ||
      this.$typedGetters['printer/getSensors'].length > 0
    )
  }

  get hasSensors (): boolean {
    return this.$typedGetters['sensors/getSensors'].length > 0
  }

  get firmwareRetractionEnabled (): boolean {
    return 'firmware_retraction' in this.printerSettings
  }

  get supportsJobQueue (): boolean {
    return this.$typedGetters['server/componentSupport']('job_queue')
  }

  get supportsBedMesh (): boolean {
    return this.$typedGetters['mesh/getSupportsBedMesh']
  }

  get supportsBeacon (): boolean {
    return this.$typedGetters['printer/getSupportsBeacon']
  }

  get supportsRunoutSensors (): boolean {
    return this.$typedGetters['printer/getRunoutSensors'].length > 0
  }

  get supportsSpoolman (): boolean {
    return this.$typedGetters['server/componentSupport']('spoolman')
  }

  get supportsMmu (): boolean {
    return this.$typedState.printer.printer.mmu != null
  }

  get supportsAfc (): boolean {
    return this.$typedGetters['printer/getSupportsAfc']
  }

  get hasMacros (): boolean {
    return this.$typedGetters['macros/getVisibleMacros'].length > 0
  }

  get hasOutputs (): boolean {
    return (
      this.$typedGetters['printer/getAllFans'].length > 0 ||
      this.$typedGetters['printer/getAllPins'].length > 0 ||
      this.$typedGetters['printer/getAllLeds'].length > 0
    )
  }

  get inLayout (): boolean {
    return this.$typedState.config.layoutMode
  }

  get layout (): LayoutContainer | undefined {
    const layoutName: string = this.$typedGetters['layout/getSpecificLayoutName']

    return this.$typedGetters['layout/getLayout'](layoutName)
  }

  get draggableOptions (): Sortable.Options {
    return {
      group: 'dashboard',
      disabled: !this.inLayout
    }
  }

  @Watch('layout')
  onLayoutChange () {
    const containers: Array<LayoutConfig[]> = []

    for (let index = 1; index <= 4; index++) {
      const container = this.layout?.[`container${index}`]

      if (container && container.length > 0) {
        containers.push(container)
      }
    }

    while (containers.length < 4) {
      containers.push([])
    }

    this.containers = containers.slice(0, 4)
  }

  handleUpdateLayout () {
    const name: string = this.$typedGetters['layout/getSpecificLayoutName']

    this.$typedDispatch('layout/onLayoutChange', {
      name,
      value: {
        container1: this.containers[0],
        container2: this.containers[1],
        container3: this.containers[2],
        container4: this.containers[3]
      }
    })
  }

  hasCards (container: LayoutConfig[]) {
    return container.some(card => card.enabled && !this.filtered(card))
  }

  cardBindings (card: LayoutConfig) {
    const type = card.type || card.id

    if (type === 'camera-card' || type === 'iframe-card') {
      return { config: card }
    }

    return {}
  }

  handleAddCamera () {
    const webcams: Moonraker.Webcam.Entry[] = this.$typedGetters['webcams/getEnabledWebcams']
    this.cameraDialog.card = createCameraCardState(webcams[0]?.uid ?? 'all')
    this.cameraDialog.active = true
  }

  handleAddIframe () {
    this.iframeDialog.card = createIframeCardState()
    this.iframeDialog.active = true
  }

  handleEditCard (card: LayoutConfig) {
    if (!isIframeCardConfig(card)) return

    this.iframeDialog.card = { ...card }
    this.iframeDialog.active = true
  }

  handleSaveCard (card: CameraCardConfig | IframeCardConfig) {
    const layout = this.layout
    if (!layout) return

    if (!layout.container1) layout.container1 = []

    if (card.id === '') {
      card.id = uuidv4()
      layout.container1.push(card)
    } else {
      for (const container of Object.values(layout)) {
        const index = container.findIndex(existing => existing.id === card.id)
        if (index > -1) {
          container.splice(index, 1, card)
          break
        }
      }
    }

    this.persistLayout(layout)
  }

  handleDeleteCard (id: string) {
    const layout = this.layout
    if (!layout) return

    for (const container of Object.values(layout)) {
      const index = container.findIndex(card => card.id === id)
      if (index < 0) continue

      const card = container[index]
      if (!isCameraCardConfig(card) && !isIframeCardConfig(card)) return

      container.splice(index, 1)
      this.persistLayout(layout)
      return
    }
  }

  persistLayout (layout: LayoutContainer) {
    const name: string = this.$typedGetters['layout/getSpecificLayoutName']

    this.$typedDispatch('layout/onLayoutChange', {
      name,
      value: layout
    })
  }

  filtered (item: LayoutConfig) {
    // Take care of special cases.
    if (this.inLayout) return false
    if ((item.type || item.id) === 'camera-card' && !this.hasCameras) return true
    if (item.id === 'macros-card' && !this.hasMacros) return true
    if (item.id === 'outputs-card' && !this.hasOutputs) return true
    if (item.id === 'printer-status-card' && !this.klippyReady) return true
    if (item.id === 'job-queue-card' && !this.supportsJobQueue) return true
    if (item.id === 'retract-card' && !this.firmwareRetractionEnabled) return true
    if (item.id === 'bed-mesh-card' && !this.supportsBedMesh) return true
    if (item.id === 'beacon-card' && !this.supportsBeacon) return true
    if (item.id === 'runout-sensors-card' && !this.supportsRunoutSensors) return true
    if (item.id === 'spoolman-card' && !this.supportsSpoolman) return true
    if (item.id === 'mmu-card' && !this.supportsMmu) return true
    if (item.id === 'sensors-card' && !this.hasSensors) return true
    if (item.id === 'temperature-card' && !this.hasHeatersOrTemperatureSensors) return true
    if (item.id === 'afc-card' && !this.supportsAfc) return true

    // Otherwise return the opposite of whatever the enabled state is.
    return !item.enabled
  }
}
</script>

<style lang="scss" scoped>
@import '@/scss/draggable.scss';
</style>
