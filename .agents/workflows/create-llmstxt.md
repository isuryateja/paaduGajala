---
description: Create or update llms.txt based on repo structure and recent changes
---

steps:

  # STEP 0 — Inject llms.txt knowledge
  - name: llmstxt_spec
    action: set_context
    content: |
      ## About llms.txt

      llms.txt is a markdown file placed at the root of a website (typically `/llms.txt`) that helps LLM-based agents understand and navigate the site efficiently.

      It is NOT a sitemap. It is a curated, high-signal guide.

      ### Key principles
      - Use Markdown format
      - Must start with an H1 (`# Project Name`)
      - Must include a short summary as a blockquote (`> summary`)
      - Organize links into sections using H2 (`## Section`)
      - Each entry should be a markdown link with a short description
      - Keep it concise and curated — avoid listing every page
      - Prefer stable, canonical URLs
      - Prefer markdown-friendly versions of pages if available

      ### Structure
      # Project Name

      > One-line summary

      Optional explanatory text

      ## Section Name
      - [Page Title](url): short description

      ## Optional
      - Lower priority links (agents may skip)

      ### What to include
      - Getting started / overview
      - Core features or concepts
      - Guides and tutorials
      - API/reference docs
      - Important examples

      ### What NOT to do
      - Do not include every page from the sitemap
      - Do not include low-value or redundant pages
      - Do not use marketing-heavy descriptions
      - Do not leave stale or broken links

      ### Goal
      Help an LLM quickly understand:
      - what the project is
      - how to use it
      - where to go next

      ### Example

      # Example Project

      > A tool for building and deploying APIs.

      ## Getting Started
      - [Overview](https://example.com): What the project does
      - [Quickstart](https://example.com/quickstart): Setup in minutes

      ## Guides
      - [Authentication](https://example.com/auth): How auth works
      - [Deployment](https://example.com/deploy): Deploy your app

      ## Reference
      - [API Docs](https://example.com/api): Full API reference

      ## Optional
      - [Changelog](https://example.com/changelog): Release history

  # STEP 1 — Check existing file
  - name: check_existing_file
    action: read_file
    path: /llms.txt
    optional: true

  # STEP 2 — Scan repo
  - name: scan_repo
    action: analyze_repo
    include:
      - README.md
      - docs/**
      - src/**
      - public/**
      - package.json
      - sitemap*

  # STEP 3 — Detect changes
  - name: detect_changes
    action: git_diff
    if: file_exists(/llms.txt)
    target: /llms.txt
    scope:
      - docs/**
      - README.md
      - src/**
      - routes/**
    output: changes

  # STEP 4 — Decide action
  - name: decide
    action: evaluate
    logic: |
      if no llms.txt -> CREATE
      else if no meaningful changes -> UNCHANGED
      else -> UPDATE

  # STEP 5 — Generate llms.txt
  - name: generate_llmstxt
    action: llm_generate
    input:
      repo_summary: scan_repo.output
      existing_file: check_existing_file.output
      changes: detect_changes.output
      llmstxt_spec: llmstxt_spec.output
    rules:
      - strictly follow llmstxt principles
      - keep curated, high-signal links only
      - avoid sitemap-like output
      - preserve valid existing content where possible
      - update only changed sections unless full rewrite needed
      - descriptions must be concise

  # STEP 6 — Validate format
  - name: validate
    action: lint_markdown
    rules:
      - must_have_h1
      - must_have_summary_blockquote
      - sections_use_h2
      - all_entries_are_links
      - no_duplicates

  # STEP 7 — Enforce semantic quality
  - name: enforce_rules
    action: validate_semantics
    rules:
      - must_not_be_sitemap_like
      - must_be_curated
      - max_sections_6
      - descriptions_under_15_words

  # STEP 8 — Write file
  - name: write_file
    action: write_file
    path: /llms.txt
    if: decision != UNCHANGED

  # STEP 9 — Output result
  - name: result
    action: output
    format: summary_with_content