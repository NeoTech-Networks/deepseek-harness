/**
 * Shared current-color product icons. Names identify the glyph and weight;
 * rendered size remains a prop instead of part of the component name. Each
 * icon references its `dsw-icon-<glyph>-<weight>` symbol in the document icon
 * sprite that ui-theme maintains, so a theme can replace the artwork without
 * touching callers and the artwork inherits `currentColor` and CSS variables.
 */
import type { ReactNode } from 'react'
import { ICON_ARTWORK, iconSymbolId, type IconGlyph, type IconWeight } from './artwork.ts'
import type { IconProps } from './props.ts'

export type { IconProps } from './props.ts'
export { ICON_MEDIUM_STROKE, ICON_REGULAR_STROKE, ICON_SYMBOLS, type IconSymbolId } from './artwork.ts'

/** Shared shield contour used by composite icons outside this module. */
export const SHIELD_OUTLINE_PATH = 'M6.80132 2.14853C7.70663 1.80917 8.70422 1.80919 9.60952 2.14859L14.1296 3.84317V7.11961C14.1296 11.6089 10.7615 13.5975 8.20543 14.5779C5.64931 13.5975 2.28052 11.6089 2.28052 7.11961V3.84317L6.80132 2.14853Z'

function productIcon(glyph: IconGlyph, weight: IconWeight): (props: IconProps) => React.JSX.Element {
  const { size: defaultSize, aspect: [width, height] = [1, 1] }: { size: number; aspect?: readonly [number, number] } = ICON_ARTWORK[glyph]
  const id = iconSymbolId(glyph, weight)
  return ({ size = defaultSize, className }: IconProps) => (
    <svg width={(size * width) / height} height={size} className={className} data-icon={id} aria-hidden="true">
      <use href={`#${id}`} />
    </svg>
  )
}

/** Regular one-pixel IconLayersOutline artwork. */
export const IconLayersOutlineRegular = productIcon('layers-outline', 'regular')

/** Medium IconLayersOutline artwork with a 1.3px stroke. */
export const IconLayersOutlineMedium = productIcon('layers-outline', 'medium')

/** Regular one-pixel IconNewChatOutline artwork. */
export const IconNewChatOutlineRegular = productIcon('new-chat-outline', 'regular')

/** Medium IconNewChatOutline artwork with a 1.3px stroke. */
export const IconNewChatOutlineMedium = productIcon('new-chat-outline', 'medium')

/** Regular one-pixel IconSearchOutline artwork. */
export const IconSearchOutlineRegular = productIcon('search-outline', 'regular')

/** Medium IconSearchOutline artwork with a 1.3px stroke. */
export const IconSearchOutlineMedium = productIcon('search-outline', 'medium')

/** Regular one-pixel IconEyeOutline artwork. */
export const IconEyeOutlineRegular = productIcon('eye-outline', 'regular')

/** Medium IconEyeOutline artwork with a 1.3px stroke. */
export const IconEyeOutlineMedium = productIcon('eye-outline', 'medium')

/** Regular one-pixel IconEyeOffOutline artwork. */
export const IconEyeOffOutlineRegular = productIcon('eye-off-outline', 'regular')

/** Medium IconEyeOffOutline artwork with a 1.3px stroke. */
export const IconEyeOffOutlineMedium = productIcon('eye-off-outline', 'medium')

/** Regular one-pixel IconGlobeOutline artwork. */
export const IconGlobeOutlineRegular = productIcon('globe-outline', 'regular')

/** Medium IconGlobeOutline artwork with a 1.3px stroke. */
export const IconGlobeOutlineMedium = productIcon('globe-outline', 'medium')

/** Regular one-pixel IconSettingsOutline artwork. */
export const IconSettingsOutlineRegular = productIcon('settings-outline', 'regular')

/** Medium IconSettingsOutline artwork with a 1.3px stroke. */
export const IconSettingsOutlineMedium = productIcon('settings-outline', 'medium')

/** Regular one-pixel IconPanelLeftOutline artwork. */
export const IconPanelLeftOutlineRegular = productIcon('panel-left-outline', 'regular')

/** Medium IconPanelLeftOutline artwork with a 1.3px stroke. */
export const IconPanelLeftOutlineMedium = productIcon('panel-left-outline', 'medium')

/** Regular IconEllipsisOutline artwork; its fill-only geometry is weight-independent. */
export const IconEllipsisOutlineRegular = productIcon('ellipsis-outline', 'regular')

/** Medium IconEllipsisOutline artwork; it matches Regular because the geometry is fill-only. */
export const IconEllipsisOutlineMedium = productIcon('ellipsis-outline', 'medium')

/** Regular one-pixel IconPlusOutline artwork. */
export const IconPlusOutlineRegular = productIcon('plus-outline', 'regular')

/** Medium IconPlusOutline artwork with a 1.3px stroke. */
export const IconPlusOutlineMedium = productIcon('plus-outline', 'medium')

/** Regular one-pixel IconCheckOutline artwork. */
export const IconCheckOutlineRegular = productIcon('check-outline', 'regular')

/** Medium IconCheckOutline artwork with a 1.3px stroke. */
export const IconCheckOutlineMedium = productIcon('check-outline', 'medium')

/** Regular one-pixel IconBranchOutline artwork. */
export const IconBranchOutlineRegular = productIcon('branch-outline', 'regular')

/** Medium IconBranchOutline artwork with a 1.3px stroke. */
export const IconBranchOutlineMedium = productIcon('branch-outline', 'medium')

/** Regular one-pixel IconChevronDownOutline artwork. */
export const IconChevronDownOutlineRegular = productIcon('chevron-down-outline', 'regular')

/** Medium IconChevronDownOutline artwork with a 1.3px stroke. */
export const IconChevronDownOutlineMedium = productIcon('chevron-down-outline', 'medium')

/** Regular one-pixel IconChevronLeftOutline artwork. */
export const IconChevronLeftOutlineRegular = productIcon('chevron-left-outline', 'regular')

/** Medium IconChevronLeftOutline artwork with a 1.3px stroke. */
export const IconChevronLeftOutlineMedium = productIcon('chevron-left-outline', 'medium')

/** Regular one-pixel IconChevronRightOutline artwork. */
export const IconChevronRightOutlineRegular = productIcon('chevron-right-outline', 'regular')

/** Medium IconChevronRightOutline artwork with a 1.3px stroke. */
export const IconChevronRightOutlineMedium = productIcon('chevron-right-outline', 'medium')

/** Regular IconTriangleRightFill artwork; its fill-only geometry is weight-independent. */
export const IconTriangleRightFillRegular = productIcon('triangle-right-fill', 'regular')

/** Medium IconTriangleRightFill artwork; it matches Regular because the geometry is fill-only. */
export const IconTriangleRightFillMedium = productIcon('triangle-right-fill', 'medium')

/** Regular one-pixel IconChevronUpOutline artwork. */
export const IconChevronUpOutlineRegular = productIcon('chevron-up-outline', 'regular')

/** Medium IconChevronUpOutline artwork with a 1.3px stroke. */
export const IconChevronUpOutlineMedium = productIcon('chevron-up-outline', 'medium')

/** Regular one-pixel IconCloseOutline artwork. */
export const IconCloseOutlineRegular = productIcon('close-outline', 'regular')

/** Medium IconCloseOutline artwork with a 1.3px stroke. */
export const IconCloseOutlineMedium = productIcon('close-outline', 'medium')

/** Regular one-pixel IconCloseFill artwork. */
export const IconCloseFillRegular = productIcon('close-fill', 'regular')

/** Medium IconCloseFill artwork with a 1.3px stroke. */
export const IconCloseFillMedium = productIcon('close-fill', 'medium')

/** Regular IconCloseCircleFill artwork (cross knocked out of a filled disc); its fill-only geometry is weight-independent. */
export const IconCloseCircleFillRegular = productIcon('close-circle-fill', 'regular')

/** Medium IconCloseCircleFill artwork; it matches Regular because the geometry is fill-only. */
export const IconCloseCircleFillMedium = productIcon('close-circle-fill', 'medium')

/** Regular one-pixel IconCopyOutline artwork. */
export const IconCopyOutlineRegular = productIcon('copy-outline', 'regular')

/** Medium IconCopyOutline artwork with a 1.3px stroke. */
export const IconCopyOutlineMedium = productIcon('copy-outline', 'medium')

/** Regular one-pixel IconRefreshOutline artwork. */
export const IconRefreshOutlineRegular = productIcon('refresh-outline', 'regular')

/** Medium IconRefreshOutline artwork with a 1.3px stroke. */
export const IconRefreshOutlineMedium = productIcon('refresh-outline', 'medium')

/** Regular one-pixel IconLikeOutline artwork. */
export const IconLikeOutlineRegular = productIcon('like-outline', 'regular')

/** Medium IconLikeOutline artwork with a 1.3px stroke. */
export const IconLikeOutlineMedium = productIcon('like-outline', 'medium')

/** Regular one-pixel IconLikeFill artwork. */
export const IconLikeFillRegular = productIcon('like-fill', 'regular')

/** Medium IconLikeFill artwork with a 1.3px stroke. */
export const IconLikeFillMedium = productIcon('like-fill', 'medium')

/** Regular one-pixel IconDislikeOutline artwork. */
export const IconDislikeOutlineRegular = productIcon('dislike-outline', 'regular')

/** Medium IconDislikeOutline artwork with a 1.3px stroke. */
export const IconDislikeOutlineMedium = productIcon('dislike-outline', 'medium')

/** Regular one-pixel IconDislikeFill artwork. */
export const IconDislikeFillRegular = productIcon('dislike-fill', 'regular')

/** Medium IconDislikeFill artwork with a 1.3px stroke. */
export const IconDislikeFillMedium = productIcon('dislike-fill', 'medium')

/** Regular one-pixel IconShareOutline artwork. */
export const IconShareOutlineRegular = productIcon('share-outline', 'regular')

/** Medium IconShareOutline artwork with a 1.3px stroke. */
export const IconShareOutlineMedium = productIcon('share-outline', 'medium')

/** Regular one-pixel IconDeliverDoc artwork. */
export const IconDeliverDocRegular = productIcon('deliver-doc', 'regular')

/** Medium IconDeliverDoc artwork with a 1.3px stroke. */
export const IconDeliverDocMedium = productIcon('deliver-doc', 'medium')

/** Regular one-pixel IconEditOutline artwork. */
export const IconEditOutlineRegular = productIcon('edit-outline', 'regular')

/** Medium IconEditOutline artwork with a 1.3px stroke. */
export const IconEditOutlineMedium = productIcon('edit-outline', 'medium')

/** Regular one-pixel IconThinkOutline artwork. */
export const IconThinkOutlineRegular = productIcon('think-outline', 'regular')

/** Medium IconThinkOutline artwork with a 1.3px stroke. */
export const IconThinkOutlineMedium = productIcon('think-outline', 'medium')

/** Regular one-pixel IconAgentPresetOutline artwork. */
export const IconAgentPresetOutlineRegular = productIcon('agent-preset-outline', 'regular')

/** Medium IconAgentPresetOutline artwork with a 1.3px stroke. */
export const IconAgentPresetOutlineMedium = productIcon('agent-preset-outline', 'medium')

/** Regular one-pixel IconBrowseOutline artwork. */
export const IconBrowseOutlineRegular = productIcon('browse-outline', 'regular')

/** Medium IconBrowseOutline artwork with a 1.3px stroke. */
export const IconBrowseOutlineMedium = productIcon('browse-outline', 'medium')

/** Regular one-pixel IconContextInjectionOutline artwork. */
export const IconContextInjectionOutlineRegular = productIcon('context-injection-outline', 'regular')

/** Medium IconContextInjectionOutline artwork with a 1.3px stroke. */
export const IconContextInjectionOutlineMedium = productIcon('context-injection-outline', 'medium')

/** Regular one-pixel IconLinkOutline artwork. */
export const IconLinkOutlineRegular = productIcon('link-outline', 'regular')

/** Medium IconLinkOutline artwork with a 1.3px stroke. */
export const IconLinkOutlineMedium = productIcon('link-outline', 'medium')

/** Regular one-pixel IconRightUpOutline artwork. */
export const IconRightUpOutlineRegular = productIcon('right-up-outline', 'regular')

/** Medium IconRightUpOutline artwork with a 1.3px stroke. */
export const IconRightUpOutlineMedium = productIcon('right-up-outline', 'medium')

/** Regular one-pixel IconEnhanceOutline artwork. */
export const IconEnhanceOutlineRegular = productIcon('enhance-outline', 'regular')

/** Medium IconEnhanceOutline artwork with a 1.3px stroke. */
export const IconEnhanceOutlineMedium = productIcon('enhance-outline', 'medium')

/** Regular one-pixel IconTrashOutline artwork. */
export const IconTrashOutlineRegular = productIcon('trash-outline', 'regular')

/** Medium IconTrashOutline artwork with a 1.3px stroke. */
export const IconTrashOutlineMedium = productIcon('trash-outline', 'medium')

/** Regular one-pixel IconWarningOutline artwork. */
export const IconWarningOutlineRegular = productIcon('warning-outline', 'regular')

/** Medium IconWarningOutline artwork with a 1.3px stroke. */
export const IconWarningOutlineMedium = productIcon('warning-outline', 'medium')

/** Regular IconCheckCircleFill artwork (circled check); its fill-only geometry is weight-independent. */
export const IconCheckCircleFillRegular = productIcon('check-circle-fill', 'regular')

/** Medium IconCheckCircleFill artwork; it matches Regular because the geometry is fill-only. */
export const IconCheckCircleFillMedium = productIcon('check-circle-fill', 'medium')

/** Regular rounded warning triangle with an exclamation mark. */
export const IconWarningTriangleOutlineRegular = productIcon('warning-triangle-outline', 'regular')

/** Medium rounded warning triangle with an exclamation mark. */
export const IconWarningTriangleOutlineMedium = productIcon('warning-triangle-outline', 'medium')

/** Regular one-pixel IconUserOutline artwork. */
export const IconUserOutlineRegular = productIcon('user-outline', 'regular')

/** Medium IconUserOutline artwork with a 1.3px stroke. */
export const IconUserOutlineMedium = productIcon('user-outline', 'medium')

/** Regular one-pixel IconUsersOutline artwork: a front person with a second person behind. */
export const IconUsersOutlineRegular = productIcon('users-outline', 'regular')

/** Medium IconUsersOutline artwork with a 1.3px stroke. */
export const IconUsersOutlineMedium = productIcon('users-outline', 'medium')

/** Regular one-pixel IconPaperPlaneOutline artwork. */
export const IconPaperPlaneOutlineRegular = productIcon('paper-plane-outline', 'regular')

/** Medium IconPaperPlaneOutline artwork with a 1.3px stroke. */
export const IconPaperPlaneOutlineMedium = productIcon('paper-plane-outline', 'medium')

/** Regular IconStopFill artwork; its fill-only geometry is weight-independent. */
export const IconStopFillRegular = productIcon('stop-fill', 'regular')

/** Medium IconStopFill artwork; it matches Regular because the geometry is fill-only. */
export const IconStopFillMedium = productIcon('stop-fill', 'medium')

/** Regular one-pixel IconPaperclipOutline artwork. */
export const IconPaperclipOutlineRegular = productIcon('paperclip-outline', 'regular')

/** Medium IconPaperclipOutline artwork with a 1.3px stroke. */
export const IconPaperclipOutlineMedium = productIcon('paperclip-outline', 'medium')

/** Regular one-pixel IconLoadingOutline artwork. */
export const IconLoadingOutlineRegular = productIcon('loading-outline', 'regular')

/** Medium IconLoadingOutline artwork with a 1.3px stroke. */
export const IconLoadingOutlineMedium = productIcon('loading-outline', 'medium')

/** Regular one-pixel IconDownloadOutline artwork. */
export const IconDownloadOutlineRegular = productIcon('download-outline', 'regular')

/** Medium IconDownloadOutline artwork with a 1.3px stroke. */
export const IconDownloadOutlineMedium = productIcon('download-outline', 'medium')

/** Regular one-pixel IconUploadOutline artwork: the download tray with the arrow pointing up. */
export const IconUploadOutlineRegular = productIcon('upload-outline', 'regular')

/** Medium IconUploadOutline artwork with a 1.3px stroke. */
export const IconUploadOutlineMedium = productIcon('upload-outline', 'medium')

/** Regular one-pixel IconPlayOutline artwork. */
export const IconPlayOutlineRegular = productIcon('play-outline', 'regular')

/** Medium IconPlayOutline artwork with a 1.3px stroke. */
export const IconPlayOutlineMedium = productIcon('play-outline', 'medium')

/** Regular one-pixel IconPauseOutline artwork. */
export const IconPauseOutlineRegular = productIcon('pause-outline', 'regular')

/** Medium IconPauseOutline artwork with a 1.3px stroke. */
export const IconPauseOutlineMedium = productIcon('pause-outline', 'medium')

/** Regular one-pixel IconFullscreenOutline artwork. */
export const IconFullscreenOutlineRegular = productIcon('fullscreen-outline', 'regular')

/** Medium IconFullscreenOutline artwork with a 1.3px stroke. */
export const IconFullscreenOutlineMedium = productIcon('fullscreen-outline', 'medium')

/** Regular one-pixel IconCodeOutline artwork. */
export const IconCodeOutlineRegular = productIcon('code-outline', 'regular')

/** Medium IconCodeOutline artwork with a 1.3px stroke. */
export const IconCodeOutlineMedium = productIcon('code-outline', 'medium')

/** Regular one-pixel IconCordisPluginOutline artwork. */
export const IconCordisPluginOutlineRegular = productIcon('cordis-plugin-outline', 'regular')

/** Medium IconCordisPluginOutline artwork with a 1.3px stroke. */
export const IconCordisPluginOutlineMedium = productIcon('cordis-plugin-outline', 'medium')

/** Regular one-pixel IconApiOutline artwork. */
export const IconApiOutlineRegular = productIcon('api-outline', 'regular')

/** Medium IconApiOutline artwork with a 1.3px stroke. */
export const IconApiOutlineMedium = productIcon('api-outline', 'medium')

/** Regular one-pixel IconPersonalizationOutline artwork. */
export const IconPersonalizationOutlineRegular = productIcon('personalization-outline', 'regular')

/** Medium IconPersonalizationOutline artwork with a 1.3px stroke. */
export const IconPersonalizationOutlineMedium = productIcon('personalization-outline', 'medium')

/** Regular one-pixel IconProjectAddOutline artwork. */
export const IconProjectAddOutlineRegular = productIcon('project-add-outline', 'regular')

/** Medium IconProjectAddOutline artwork with a 1.3px stroke. */
export const IconProjectAddOutlineMedium = productIcon('project-add-outline', 'medium')

/** Regular one-pixel IconFolderOpenOutline artwork. */
export const IconFolderOpenOutlineRegular = productIcon('folder-open-outline', 'regular')

/** Medium IconFolderOpenOutline artwork with a 1.3px stroke. */
export const IconFolderOpenOutlineMedium = productIcon('folder-open-outline', 'medium')

/** Regular IconFolderOpen artwork; its fill-only geometry is weight-independent. */
export const IconFolderOpenRegular = productIcon('folder-open', 'regular')

/** Medium IconFolderOpen artwork; it matches Regular because the geometry is fill-only. */
export const IconFolderOpenMedium = productIcon('folder-open', 'medium')

/** Regular one-pixel IconFolderClose artwork. */
export const IconFolderCloseRegular = productIcon('folder-close', 'regular')

/** Medium IconFolderClose artwork with a 1.3px stroke. */
export const IconFolderCloseMedium = productIcon('folder-close', 'medium')

/** Regular one-pixel IconTreeCorner artwork. */
export const IconTreeCornerRegular = productIcon('tree-corner', 'regular')

/** Medium IconTreeCorner artwork with a 1.3px stroke. */
export const IconTreeCornerMedium = productIcon('tree-corner', 'medium')

/** Regular one-pixel IconLightOutline artwork. */
export const IconLightOutlineRegular = productIcon('light-outline', 'regular')

/** Medium IconLightOutline artwork with a 1.3px stroke. */
export const IconLightOutlineMedium = productIcon('light-outline', 'medium')

/** Regular one-pixel IconDarkOutline artwork. */
export const IconDarkOutlineRegular = productIcon('dark-outline', 'regular')

/** Medium IconDarkOutline artwork with a 1.3px stroke. */
export const IconDarkOutlineMedium = productIcon('dark-outline', 'medium')

/** Regular one-pixel IconFollowsystemOutline artwork. */
export const IconFollowsystemOutlineRegular = productIcon('followsystem-outline', 'regular')

/** Medium IconFollowsystemOutline artwork with a 1.3px stroke. */
export const IconFollowsystemOutlineMedium = productIcon('followsystem-outline', 'medium')

/** Regular one-pixel IconDataOutline artwork. */
export const IconDataOutlineRegular = productIcon('data-outline', 'regular')

/** Medium IconDataOutline artwork with a 1.3px stroke. */
export const IconDataOutlineMedium = productIcon('data-outline', 'medium')

/** Regular one-pixel IconDatabaseOutline artwork. */
export const IconDatabaseOutlineRegular = productIcon('database-outline', 'regular')

/** Medium IconDatabaseOutline artwork with a 1.3px stroke. */
export const IconDatabaseOutlineMedium = productIcon('database-outline', 'medium')

/** Regular one-pixel IconClockOutline artwork. */
export const IconClockOutlineRegular = productIcon('clock-outline', 'regular')

/** Medium IconClockOutline artwork with a 1.3px stroke. */
export const IconClockOutlineMedium = productIcon('clock-outline', 'medium')

/** Regular one-pixel IconGaugeOutline artwork. */
export const IconGaugeOutlineRegular = productIcon('gauge-outline', 'regular')

/** Medium IconGaugeOutline artwork with a 1.3px stroke. */
export const IconGaugeOutlineMedium = productIcon('gauge-outline', 'medium')

/** Regular one-pixel IconSendOutline artwork. */
export const IconSendOutlineRegular = productIcon('send-outline', 'regular')

/** Medium IconSendOutline artwork with a 1.3px stroke. */
export const IconSendOutlineMedium = productIcon('send-outline', 'medium')

/** Regular one-pixel IconQueueOutline artwork. */
export const IconQueueOutlineRegular = productIcon('queue-outline', 'regular')

/** Medium IconQueueOutline artwork with a 1.3px stroke. */
export const IconQueueOutlineMedium = productIcon('queue-outline', 'medium')

/** Regular one-pixel IconChecklistOutline artwork. */
export const IconChecklistOutlineRegular = productIcon('checklist-outline', 'regular')

/** Medium IconChecklistOutline artwork with a 1.3px stroke. */
export const IconChecklistOutlineMedium = productIcon('checklist-outline', 'medium')

/** Regular one-pixel IconListPenOutline artwork. */
export const IconListPenOutlineRegular = productIcon('list-pen-outline', 'regular')

/** Medium IconListPenOutline artwork with a 1.3px stroke. */
export const IconListPenOutlineMedium = productIcon('list-pen-outline', 'medium')

/** Regular one-pixel IconGoalOutline artwork. */
export const IconGoalOutlineRegular = productIcon('goal-outline', 'regular')

/** Medium IconGoalOutline artwork with a 1.3px stroke. */
export const IconGoalOutlineMedium = productIcon('goal-outline', 'medium')

/** Regular one-pixel IconSparkle artwork. */
export const IconSparkleRegular = productIcon('sparkle', 'regular')

/** Medium IconSparkle artwork with a 1.3px stroke. */
export const IconSparkleMedium = productIcon('sparkle', 'medium')

/** Regular one-pixel IconInspectOutline artwork. */
export const IconInspectOutlineRegular = productIcon('inspect-outline', 'regular')

/** Medium IconInspectOutline artwork with a 1.3px stroke. */
export const IconInspectOutlineMedium = productIcon('inspect-outline', 'medium')

/** Regular one-pixel IconSkillOutline artwork. */
export const IconSkillOutlineRegular = productIcon('skill-outline', 'regular')

/** Medium IconSkillOutline artwork with a 1.3px stroke. */
export const IconSkillOutlineMedium = productIcon('skill-outline', 'medium')

/** Regular one-pixel IconQuestionOutline artwork. */
export const IconQuestionOutlineRegular = productIcon('question-outline', 'regular')

/** Medium IconQuestionOutline artwork with a 1.3px stroke. */
export const IconQuestionOutlineMedium = productIcon('question-outline', 'medium')

/** Regular IconInfoOutline artwork; its fill-only geometry is weight-independent. */
export const IconInfoOutlineRegular = productIcon('info-outline', 'regular')

/** Medium IconInfoOutline artwork; its fill-only geometry is weight-independent. */
export const IconInfoOutlineMedium = productIcon('info-outline', 'medium')

/** Regular one-pixel plugin pinwheel artwork. */
export const IconPluginPinwheelOutlineRegular = productIcon('plugin-pinwheel-outline', 'regular')

/** Medium plugin pinwheel artwork with a 1.3px stroke. */
export const IconPluginPinwheelOutlineMedium = productIcon('plugin-pinwheel-outline', 'medium')

/** Regular one-pixel IconAlarmClockOutline artwork. */
export const IconAlarmClockOutlineRegular = productIcon('alarm-clock-outline', 'regular')

/** Medium IconAlarmClockOutline artwork with a 1.3px stroke. */
export const IconAlarmClockOutlineMedium = productIcon('alarm-clock-outline', 'medium')

/** Regular one-pixel IconArchiveOutline artwork. */
export const IconArchiveOutlineRegular = productIcon('archive-outline', 'regular')

/** Medium IconArchiveOutline artwork with a 1.3px stroke. */
export const IconArchiveOutlineMedium = productIcon('archive-outline', 'medium')

/** Regular one-pixel IconWrapLinesOutline artwork. */
export const IconWrapLinesOutlineRegular = productIcon('wrap-lines-outline', 'regular')

/** Medium IconWrapLinesOutline artwork with a 1.3px stroke. */
export const IconWrapLinesOutlineMedium = productIcon('wrap-lines-outline', 'medium')

/** Regular IconNowrapFill artwork; fill-only weights render identically. */
export const IconNowrapFillRegular = productIcon('nowrap-fill', 'regular')

/** Medium IconNowrapFill artwork; fill-only weights render identically. */
export const IconNowrapFillMedium = productIcon('nowrap-fill', 'medium')

/** Regular IconWrapFill artwork; fill-only weights render identically. */
export const IconWrapFillRegular = productIcon('wrap-fill', 'regular')

/** Medium IconWrapFill artwork; fill-only weights render identically. */
export const IconWrapFillMedium = productIcon('wrap-fill', 'medium')

/** Regular one-pixel IconCompareSplitOutline artwork. */
export const IconCompareSplitOutlineRegular = productIcon('compare-split-outline', 'regular')

/** Medium IconCompareSplitOutline artwork with a 1.3px stroke. */
export const IconCompareSplitOutlineMedium = productIcon('compare-split-outline', 'medium')

/** Regular one-pixel IconPlanOutline artwork. */
export const IconPlanOutlineRegular = productIcon('plan-outline', 'regular')

/** Medium IconPlanOutline artwork with a 1.3px stroke. */
export const IconPlanOutlineMedium = productIcon('plan-outline', 'medium')

/** Regular one-pixel IconCompactOutline artwork. */
export const IconCompactOutlineRegular = productIcon('compact-outline', 'regular')

/** Medium IconCompactOutline artwork with a 1.3px stroke. */
export const IconCompactOutlineMedium = productIcon('compact-outline', 'medium')

/** Regular one-pixel IconShieldOutline artwork. */
export const IconShieldOutlineRegular = productIcon('shield-outline', 'regular')

/** Medium IconShieldOutline artwork with a 1.3px stroke. */
export const IconShieldOutlineMedium = productIcon('shield-outline', 'medium')

/** Regular one-pixel IconCheckCircleOutline artwork. */
export const IconCheckCircleOutlineRegular = productIcon('check-circle-outline', 'regular')

/** Medium IconCheckCircleOutline artwork with a 1.3px stroke. */
export const IconCheckCircleOutlineMedium = productIcon('check-circle-outline', 'medium')

/** Regular one-pixel IconUnarchiveOutline artwork. */
export const IconUnarchiveOutlineRegular = productIcon('unarchive-outline', 'regular')

/** Medium IconUnarchiveOutline artwork with a 1.3px stroke. */
export const IconUnarchiveOutlineMedium = productIcon('unarchive-outline', 'medium')

/** Regular one-pixel IconPinOutline artwork. */
export const IconPinOutlineRegular = productIcon('pin-outline', 'regular')

/** Medium IconPinOutline artwork with a 1.3px stroke. */
export const IconPinOutlineMedium = productIcon('pin-outline', 'medium')

/** Regular one-pixel IconPinFill artwork. */
export const IconPinFillRegular = productIcon('pin-fill', 'regular')

/** Medium IconPinFill artwork with a 1.3px stroke. */
export const IconPinFillMedium = productIcon('pin-fill', 'medium')

/** Regular one-pixel IconFlatListOutline artwork. */
export const IconFlatListOutlineRegular = productIcon('flat-list-outline', 'regular')

/** Medium IconFlatListOutline artwork with a 1.3px stroke. */
export const IconFlatListOutlineMedium = productIcon('flat-list-outline', 'medium')

/** Regular one-pixel IconWorkspaceTreeOutline artwork. */
export const IconWorkspaceTreeOutlineRegular = productIcon('workspace-tree-outline', 'regular')

/** Medium IconWorkspaceTreeOutline artwork with a 1.3px stroke. */
export const IconWorkspaceTreeOutlineMedium = productIcon('workspace-tree-outline', 'medium')

/** Regular one-pixel IconChevronsUpDownOutline artwork. */
export const IconChevronsUpDownOutlineRegular = productIcon('chevrons-up-down-outline', 'regular')

/** Medium IconChevronsUpDownOutline artwork with a 1.3px stroke. */
export const IconChevronsUpDownOutlineMedium = productIcon('chevrons-up-down-outline', 'medium')

/** Regular one-pixel IconDragHandleOutline artwork. */
export const IconDragHandleOutlineRegular = productIcon('drag-handle-outline', 'regular')

/** Medium IconDragHandleOutline artwork with a 1.3px stroke. */
export const IconDragHandleOutlineMedium = productIcon('drag-handle-outline', 'medium')

/** Regular one-pixel IconArchiveOffOutline artwork. */
export const IconArchiveOffOutlineRegular = productIcon('archive-off-outline', 'regular')

/** Medium IconArchiveOffOutline artwork with a 1.3px stroke. */
export const IconArchiveOffOutlineMedium = productIcon('archive-off-outline', 'medium')

/** Regular one-pixel IconArchiveCheckOutline artwork. */
export const IconArchiveCheckOutlineRegular = productIcon('archive-check-outline', 'regular')

/** Medium IconArchiveCheckOutline artwork with a 1.3px stroke. */
export const IconArchiveCheckOutlineMedium = productIcon('archive-check-outline', 'medium')

/** Regular one-pixel IconSlidersTwoOutline artwork. */
export const IconSlidersTwoOutlineRegular = productIcon('sliders-two-outline', 'regular')

/** Medium IconSlidersTwoOutline artwork with a 1.3px stroke. */
export const IconSlidersTwoOutlineMedium = productIcon('sliders-two-outline', 'medium')

/** Microphone with uniform one-pixel strokes. */
export const IconMicrophoneOutlineRegular = productIcon('microphone-outline', 'regular')

/** Microphone with uniform 1.3px strokes. */
export const IconMicrophoneOutlineMedium = productIcon('microphone-outline', 'medium')

/**
 * The session stage marks (fork), drawn for the sidebar's status slot from the
 * Claude Design project "dsh icons" (`Session Stage Icons`, read 2026-09-19).
 * Stroke glyphs on a 24px grid rendered at the rows' 14px slot, which is why
 * the regular weight is the design's 14px stroke of 2.2.
 *
 * Motion is deliberately NOT here: every element the design animates carries
 * a `data-part` name, and the session row's stylesheet owns the keyframes and
 * transform origins, so one rule honours `prefers-reduced-motion` for all
 * eight and a still consumer draws the design's complete resting frame.
 * `data-part="detail"` and the numbered plan checks mark the strokes the design
 * drops below 16px.
 */

/** Stage marks are drawn at a chosen stroke rather than looked up in the sprite. */
interface WeightedIconProps extends IconProps {
  strokeWidth: number
}

/** Design stroke of the stage marks at their 14px working size. */
const STAGE_REGULAR_STROKE = 2.2

/** Emphasized stage-mark stroke. */
const STAGE_MEDIUM_STROKE = 2.6

const StageSvg = ({ size = 14, className, strokeWidth, children }: WeightedIconProps & { children: ReactNode }) => (
  <svg
    width={size}
    height={size}
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    {children}
  </svg>
)

const IconStageWorkingOutlineArtwork = (props: WeightedIconProps) => (
  <StageSvg {...props}>
    <g data-part="arc">
      <path d="M12 2.9a9.1 9.1 0 0 1 9.1 9.1" />
      <path d="M12 21.1A9.1 9.1 0 0 1 2.9 12" opacity=".95" />
    </g>
    <g data-part="arc-back">
      <path d="M12 6.6a5.4 5.4 0 0 1 5.4 5.4" opacity=".4" />
    </g>
    <circle data-part="core" cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
  </StageSvg>
)

/** Regular stage.working mark: a run in flight with no finer stage to report. */
export const IconStageWorkingOutlineRegular = (props: IconProps) => (
  <IconStageWorkingOutlineArtwork {...props} strokeWidth={STAGE_REGULAR_STROKE} />
)

/** Medium stage.working mark. */
export const IconStageWorkingOutlineMedium = (props: IconProps) => (
  <IconStageWorkingOutlineArtwork {...props} strokeWidth={STAGE_MEDIUM_STROKE} />
)

const IconStageWritingOutlineArtwork = (props: WeightedIconProps) => (
  <StageSvg {...props}>
    <g data-part="nib">
      <path d="M18.5 3.5a2.1 2.1 0 0 1 3 3L11 17l-4 1 1-4Z" />
    </g>
    <path data-part="ink" d="M4 20.5h9" strokeDasharray="14" />
    <path data-part="ink2" d="M4 16.5h4" strokeDasharray="14" opacity=".45" />
  </StageSvg>
)

/** Regular stage.writing mark: the model is producing output into the transcript. */
export const IconStageWritingOutlineRegular = (props: IconProps) => (
  <IconStageWritingOutlineArtwork {...props} strokeWidth={STAGE_REGULAR_STROKE} />
)

/** Medium stage.writing mark. */
export const IconStageWritingOutlineMedium = (props: IconProps) => (
  <IconStageWritingOutlineArtwork {...props} strokeWidth={STAGE_MEDIUM_STROKE} />
)

const IconStageAwaitingInputOutlineArtwork = (props: WeightedIconProps) => (
  <StageSvg {...props}>
    <path d="M3.4 6.1a2 2 0 0 1 2-2h13.2a2 2 0 0 1 2 2v8.6a2 2 0 0 1-2 2h-8.3L5.6 20.4v-3.7h-.2a2 2 0 0 1-2-2Z" />
    <path d="M7.6 9.1h6.4" opacity=".5" />
    <path data-part="caret" d="M16.6 9.1v3.4" strokeWidth="2.6" />
    <path d="M7.6 12.5h6.4" opacity=".5" />
  </StageSvg>
)

/** Regular stage.awaiting_input mark: the run is halted until a person answers or approves. */
export const IconStageAwaitingInputOutlineRegular = (props: IconProps) => (
  <IconStageAwaitingInputOutlineArtwork {...props} strokeWidth={STAGE_REGULAR_STROKE} />
)

/** Medium stage.awaiting_input mark. */
export const IconStageAwaitingInputOutlineMedium = (props: IconProps) => (
  <IconStageAwaitingInputOutlineArtwork {...props} strokeWidth={STAGE_MEDIUM_STROKE} />
)

const IconStageBlockedOutlineArtwork = (props: WeightedIconProps) => (
  <StageSvg {...props}>
    <g data-part="glass">
      <path d="M6.6 3.2h10.8M6.6 20.8h10.8" />
      <path d="M8.2 3.2v3.3c0 2.1 3.8 3.4 3.8 5.5s-3.8 3.4-3.8 5.5v3.3" />
      <path d="M15.8 3.2v3.3c0 2.1-3.8 3.4-3.8 5.5s3.8 3.4 3.8 5.5v3.3" />
      <path data-part="detail" d="M9.6 18.6c.8-1.5 3.9-1.5 4.8 0" opacity=".55" />
      <circle data-part="grain" cx="12" cy="10.4" r=".95" fill="currentColor" stroke="none" />
    </g>
  </StageSvg>
)

/** Regular stage.blocked mark: work is queued behind a gate or a provider limit. */
export const IconStageBlockedOutlineRegular = (props: IconProps) => (
  <IconStageBlockedOutlineArtwork {...props} strokeWidth={STAGE_REGULAR_STROKE} />
)

/** Medium stage.blocked mark. */
export const IconStageBlockedOutlineMedium = (props: IconProps) => (
  <IconStageBlockedOutlineArtwork {...props} strokeWidth={STAGE_MEDIUM_STROKE} />
)

const IconStageFailedOutlineArtwork = (props: WeightedIconProps) => (
  <StageSvg {...props}>
    <g data-part="cross">
      <circle cx="12" cy="12" r="8.6" />
      <path data-part="cross-a" d="m9 9 6 6" strokeDasharray="10" />
      <path data-part="cross-b" d="m15 9-6 6" strokeDasharray="10" />
    </g>
  </StageSvg>
)

/** Regular stage.failed mark: the session ended on an error; nothing further will run. */
export const IconStageFailedOutlineRegular = (props: IconProps) => (
  <IconStageFailedOutlineArtwork {...props} strokeWidth={STAGE_REGULAR_STROKE} />
)

/** Medium stage.failed mark. */
export const IconStageFailedOutlineMedium = (props: IconProps) => (
  <IconStageFailedOutlineArtwork {...props} strokeWidth={STAGE_MEDIUM_STROKE} />
)

const IconStageSavedOutlineArtwork = (props: WeightedIconProps) => (
  <StageSvg {...props}>
    <g data-part="card">
      <path d="M4.5 6.2A1.7 1.7 0 0 1 6.2 4.5h9.4L19.5 8.4v9.4a1.7 1.7 0 0 1-1.7 1.7H6.2a1.7 1.7 0 0 1-1.7-1.7Z" />
      <path d="M8.2 4.5v4h6v-4" opacity=".45" />
    </g>
    <path data-part="check" d="m8.6 14.4 2.2 2.2 4.6-4.6" strokeDasharray="12" />
  </StageSvg>
)

/** Regular stage.saved mark: state written to the handoff file; safe to resume later. */
export const IconStageSavedOutlineRegular = (props: IconProps) => (
  <IconStageSavedOutlineArtwork {...props} strokeWidth={STAGE_REGULAR_STROKE} />
)

/** Medium stage.saved mark. */
export const IconStageSavedOutlineMedium = (props: IconProps) => (
  <IconStageSavedOutlineArtwork {...props} strokeWidth={STAGE_MEDIUM_STROKE} />
)

const IconStagePlanReadyOutlineArtwork = (props: WeightedIconProps) => (
  <StageSvg {...props}>
    <path d="M4 5.6h10" opacity=".5" />
    <path d="M4 12h10" opacity=".5" />
    <path d="M4 18.4h6" opacity=".5" />
    <path data-part="check" d="m17 4.2 1.6 1.6 3-3" strokeDasharray="12" />
    <path data-part="check-2" d="m17 10.6 1.6 1.6 3-3" strokeDasharray="12" />
    <path data-part="check-3" d="m17 17 1.6 1.6 3-3" strokeDasharray="12" />
  </StageSvg>
)

/** Regular stage.plan_ready mark: every step resolved and approved, awaiting the go command. */
export const IconStagePlanReadyOutlineRegular = (props: IconProps) => (
  <IconStagePlanReadyOutlineArtwork {...props} strokeWidth={STAGE_REGULAR_STROKE} />
)

/** Medium stage.plan_ready mark. */
export const IconStagePlanReadyOutlineMedium = (props: IconProps) => (
  <IconStagePlanReadyOutlineArtwork {...props} strokeWidth={STAGE_MEDIUM_STROKE} />
)

const IconStageDeployingOutlineArtwork = (props: WeightedIconProps) => (
  <StageSvg {...props}>
    <path d="M4.5 15.5v3.2a1.3 1.3 0 0 0 1.3 1.3h12.4a1.3 1.3 0 0 0 1.3-1.3v-3.2" />
    <path d="M7.6 17.9h.01M11 17.9h.01" opacity=".5" />
    <g data-part="arrow">
      <path d="M12 12.6V3.6" />
      <path d="m8.4 7.2 3.6-3.6 3.6 3.6" />
    </g>
    <path data-part="sweep" d="M8.6 12.9h6.8" opacity=".3" />
  </StageSvg>
)

/** Regular stage.deploying mark: the publish command is running against the live target. */
export const IconStageDeployingOutlineRegular = (props: IconProps) => (
  <IconStageDeployingOutlineArtwork {...props} strokeWidth={STAGE_REGULAR_STROKE} />
)

/** Medium stage.deploying mark. */
export const IconStageDeployingOutlineMedium = (props: IconProps) => (
  <IconStageDeployingOutlineArtwork {...props} strokeWidth={STAGE_MEDIUM_STROKE} />
)

/** `compact` moves the tiles 0.5px inward, for glyphs drawn at card size. */
type AppsAddIconProps = IconProps & { readonly compact?: boolean | undefined }

function appsAddIcon(weight: IconWeight): (props: AppsAddIconProps) => React.JSX.Element {
  const Wide = productIcon('apps-add-outline', weight)
  const Compact = productIcon('apps-add-compact-outline', weight)
  return ({ compact = false, ...props }: AppsAddIconProps) => (compact ? <Compact {...props} /> : <Wide {...props} />)
}

/** Three entry tiles and an add mark with one-pixel strokes. */
export const IconAppsAddOutlineRegular = appsAddIcon('regular')

/** Three entry tiles and an add mark with 1.3px strokes. */
export const IconAppsAddOutlineMedium = appsAddIcon('medium')

/** Regular floppy-disk save action. */
export const IconSaveOutlineRegular = productIcon('save-outline', 'regular')

/** Medium floppy-disk save action. */
export const IconSaveOutlineMedium = productIcon('save-outline', 'medium')
