Pod::Spec.new do |s|
  s.name = 'ar-launcher'
  s.version = '0.0.1'
  s.summary = 'AR Launcher Plugin'
  s.license = 'MIT'
  s.homepage = 'https://tayrona3d.app'
  s.author = 'Tayrona'
  s.source = { :git => '', :tag => s.version.to_s }
  s.source_files = 'ios/Plugin/**/*.{swift,h,m,c,cc,mm,cpp}'
  s.ios.deployment_target  = '13.0'
  s.dependency 'Capacitor'
end
