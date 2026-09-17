(function (root) {
  'use strict'
  root.UltimateTopicMappingEditor = {
    apply ($, container, topicMode, config) {
      if (!$('#ultimate-topic-mapping-style').length) {
        $('<style id="ultimate-topic-mapping-style">.ultimate-topic-mode [id^="node-input-dpt"],.ultimate-topic-mode [id^="node-input-"][id$="DPT"],.ultimate-topic-mode .matter-mapped-dpt,.ultimate-topic-mode .ultimate-dpt-label,.ultimate-topic-mode label[for^="node-input-dpt"],.ultimate-topic-mode label[for^="node-input-"][for$="DPT"],.ultimate-topic-mode [data-i18n$="common.dpt"]{display:none!important}</style>').appendTo('head')
      }
      container.toggleClass('ultimate-topic-mode', topicMode)
      container.find('input[id^="node-input-GA"],input[id^="node-input-ga"],input[id^="node-input-"][id$="GA"],.matter-mapped-ga,.ultimate-mapped-address').each(function () {
        const input = $(this)
        if (input.data('knx-placeholder') === undefined) input.data('knx-placeholder', input.attr('placeholder') || '')
        input.attr('placeholder', topicMode ? 'msg.topic' : input.data('knx-placeholder'))
        input.attr('title', topicMode ? 'msg.topic → msg.payload' : '')
      })
      // Preserve hidden DPT settings when a profile refresh clears its dropdown.
      if (topicMode) {
        container.find('select[id^="node-input-dpt"],select[id^="node-input-"][id$="DPT"]').each(function () {
          const field = $(this)
          const value = config[this.id.slice('node-input-'.length)]
          if (!field.val() && value) field.append($('<option>').val(value).text(value)).val(value)
        })
        $('#node-input-enableNodePINS').val('yes')
      }
    }
  }
}(typeof window !== 'undefined' ? window : globalThis))
