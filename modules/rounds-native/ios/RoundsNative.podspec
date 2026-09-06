Pod::Spec.new do |s|
  s.name           = 'RoundsNative'
  s.version        = '1.0.0'
  s.summary        = 'ROUNDS system surfaces: Live Activity, widgets, Control Center, App Intents.'
  s.license        = 'MIT'
  s.author         = 'ROUNDS'
  s.homepage       = 'https://rounds.app'
  s.platforms      = { :ios => '15.1' }
  s.swift_version  = '5.9'
  s.source         = { git: 'https://github.com/rounds/app' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }

  # Only the files that belong to the APP.
  #
  # This used to be `'**/*.{h,m,swift}'`, which swept every Swift file in this
  # directory into the app's static framework — including RoundsWidgetBundle
  # with its `@main`, and the widget, Live Activity view and Control Center
  # types that belong to the extension. The extension compiles its own copies
  # (see WIDGET_EXTENSION in ../plugin/withRoundsNative.js), so a glob here put
  # every one of them in two targets: duplicate `@main`, duplicate symbols, and
  # a Control Center control built against a 15.1 deployment target.
  #
  # RoundsShared and RoundsActivityAttributes are deliberately in both: the app
  # and the extension are separate processes sharing an App Group suite and an
  # ActivityAttributes type, not a shared library. RoundsNativeModule is the
  # Expo module and belongs to the app alone.
  s.source_files = 'RoundsNativeModule.swift', 'RoundsShared.swift', 'RoundsActivityAttributes.swift'
end
