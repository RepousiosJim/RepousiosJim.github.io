# Checks every project file before the site is built.
# Run from the repo root: ruby tools/check_projects.rb
require "yaml"
require "date"

config = YAML.safe_load(File.read("_config.yml", encoding: "UTF-8"))
kinds = config.fetch("kinds").keys
errors = []

Dir["_projects/*.md"].sort.each do |path|
  text = File.read(path, encoding: "UTF-8")
  front = text[/\A---\s*\n(.*?)\n---/m, 1]
  unless front
    errors << "#{path}: missing front matter"
    next
  end
  begin
    data = YAML.safe_load(front, permitted_classes: [Date])
  rescue Psych::SyntaxError => e
    errors << "#{path}: YAML error (quote values that contain a colon): #{e.message}"
    next
  end

  %w[title order kind status tagline].each do |key|
    errors << "#{path}: missing `#{key}`" if data[key].nil? || data[key].to_s.strip.empty?
  end
  Array(data["kind"]).each do |k|
    errors << "#{path}: kind `#{k}` is not listed under `kinds:` in _config.yml" unless kinds.include?(k)
  end

  images = []
  images << data["image"] if data["image"]
  Array(data["gallery"]).each { |g| images << g["src"] }
  images.each do |src|
    file = src.sub(%r{\A/}, "")
    unless File.exist?(file)
      errors << "#{path}: image #{src} does not exist"
      next
    end
    base = File.basename(file, ".webp")
    [480, 800].each do |w|
      small = "assets/sm/#{base}-#{w}.webp"
      errors << "#{path}: missing #{small} (see README, Images)" unless File.exist?(small)
    end
  end
  errors << "#{path}: spotlight project needs an image" if data["spotlight"] && !data["image"]
end

spotlights = Dir["_projects/*.md"].count { |p| File.read(p, encoding: "UTF-8") =~ /^spotlight:\s*true/ }
errors << "more than one project has `spotlight: true`" if spotlights > 1

if errors.empty?
  puts "Project files OK"
else
  puts errors
  exit 1
end
