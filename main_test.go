package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestBuild(t *testing.T) {
	out := t.TempDir()
	if err := build("data.json", "templates/index.html.tmpl", "static", out); err != nil {
		t.Fatal(err)
	}
	html, _ := os.ReadFile(filepath.Join(out, "index.html"))
	d, _ := load("data.json")
	if !strings.Contains(string(html), d.Name) {
		t.Fatal("name missing in output")
	}
	if _, err := os.Stat(filepath.Join(out, "style.css")); err != nil {
		t.Fatal("static assets not copied")
	}
}

func TestInvalidLevel(t *testing.T) {
	p := filepath.Join(t.TempDir(), "d.json")
	os.WriteFile(p, []byte(`{"Name":"a","Role":"b","Skills":[{"Group":"g","Items":[{"Name":"x","Level":9}]}]}`), 0o644)
	if _, err := load(p); err == nil {
		t.Fatal("expected validation error")
	}
}
