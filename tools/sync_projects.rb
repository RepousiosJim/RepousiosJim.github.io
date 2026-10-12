# Updates each project's `updated:` date and Version fact from its GitHub repo.
#
#   GITHUB_TOKEN=... ruby tools/sync_projects.rb
#
# A project takes part when its front matter has `repo: owner/name`.
# - `updated:` becomes the date of the latest commit on the repo's default branch
#   (it never moves backwards).
# - A fact with `label: Version` becomes the latest release tag, or the highest
#   version tag when the repo has no releases.
# Repos the token can't read are skipped with a warning, so the job never fails
# just because one repo is private.
require "json"
require "net/http"
require "uri"
require "date"

TOKEN = ENV["GITHUB_TOKEN"].to_s

def api(path)
  uri = URI("https://api.github.com#{path}")
  req = Net::HTTP::Get.new(uri)
  req["Accept"] = "application/vnd.github+json"
  req["X-GitHub-Api-Version"] = "2022-11-28"
  req["User-Agent"] = "gemelon-portfolio-sync"
  req["Authorization"] = "Bearer #{TOKEN}" unless TOKEN.empty?
  res = Net::HTTP.start(uri.host, uri.port, use_ssl: true) { |http| http.request(req) }
  [res.code.to_i, (JSON.parse(res.body) rescue nil)]
end

def version_key(tag)
  tag.to_s.sub(/\Av/i, "").split(/[.\-+]/).map { |p| p =~ /\A\d+\z/ ? [0, p.to_i] : [1, p] }
end

def latest_version(repo)
  code, rel = api("/repos/#{repo}/releases/latest")
  return rel["tag_name"] if code == 200 && rel && rel["tag_name"]
  code, tags = api("/repos/#{repo}/tags?per_page=100")
  return nil unless code == 200 && tags.is_a?(Array)
  names = tags.map { |t| t["name"] }.grep(/\Av?\d+(\.\d+)+/)
  names.max_by { |n| version_key(n) }
end

changes = []
warnings = []

Dir["_projects/*.md"].sort.each do |path|
  text = File.read(path, encoding: "UTF-8")
  repo = text[/^repo:\s*["']?([\w.-]+\/[\w.-]+)["']?\s*$/, 1]
  next unless repo

  code, info = api("/repos/#{repo}")
  if code != 200
    warnings << "#{path}: can't read #{repo} (HTTP #{code}); skipped"
    next
  end
  branch = info["default_branch"]
  code, commits = api("/repos/#{repo}/commits?sha=#{URI.encode_www_form_component(branch)}&per_page=1")
  if code == 200 && commits.is_a?(Array) && commits.first
    date = Date.parse(commits.first.dig("commit", "committer", "date")).to_s
    current = text[/^updated:\s*(\d{4}-\d{2}-\d{2})\s*$/, 1]
    if current.nil?
      text = text.sub(/^(status:.*)$/) { "updated: #{date}\n#{$1}" }
      changes << "#{path}: updated #{date} (added)"
    elsif date > current
      text = text.sub(/^updated:\s*\d{4}-\d{2}-\d{2}\s*$/, "updated: #{date}")
      changes << "#{path}: updated #{current} -> #{date}"
    end
  else
    warnings << "#{path}: no commits found for #{repo} (HTTP #{code})"
  end

  version_line = /^(\s*-\s*\{\s*label:\s*Version,\s*value:\s*)("?)([^"}]*?)("?)(\s*\}\s*)$/
  if text =~ version_line
    tag = latest_version(repo)
    old = text[version_line, 3].strip
    if tag && tag != old
      text = text.sub(version_line) { "#{$1}#{$2}#{tag}#{$4}#{$5}" }
      changes << "#{path}: version #{old} -> #{tag}"
    end
  end

  File.write(path, text)
end

puts warnings.map { |w| "warning: #{w}" }
puts changes.empty? ? "No changes" : changes
