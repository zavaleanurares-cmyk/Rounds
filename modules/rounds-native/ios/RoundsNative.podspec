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

  s.source_files = '**/*.{h,m,swift}'
end
