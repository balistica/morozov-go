// Static site generator: data.json + templates -> dist/ (deployed to GitHub Pages by CI).
package main

import (
	"encoding/json"
	"errors"
	"flag"
	"html/template"
	"io"
	"io/fs"
	"log"
	"os"
	"path/filepath"
	"time"
)

type Link struct{ Label, URL string }
type Stat struct{ Value, Label string }
type Skill struct {
	Name  string
	Level int // 1..5
}
type SkillGroup struct {
	Group string
	Note  string
	Items []Skill
}
type Job struct {
	Company, Role, Period string
	Bullets               []string
}
type Case struct {
	Title, Problem, Task, Result string
	Solution                     []string
	Metrics                      []Stat
}
type Strength struct{ Title, Text string }
type Project struct {
	Name, Desc, URL string
	Stack           []string
}
type Data struct {
	Name, Role, Tagline, Location, About string
	Links                                []Link
	Stats                                []Stat
	Skills                               []SkillGroup
	Experience                           []Job
	Cases                                []Case
	Strengths                            []Strength
	Projects                             []Project
	Built                                string
}

func load(path string) (*Data, error) {
	raw, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	var d Data
	if err := json.Unmarshal(raw, &d); err != nil {
		return nil, err
	}
	if d.Name == "" || d.Role == "" {
		return nil, errors.New("data.json: name and role are required")
	}
	for _, g := range d.Skills {
		for _, s := range g.Items {
			if s.Level < 1 || s.Level > 5 {
				return nil, errors.New("skill level must be 1..5: " + s.Name)
			}
		}
	}
	d.Built = time.Now().UTC().Format("2006-01-02")
	return &d, nil
}

func copyDir(src, dst string) error {
	return filepath.WalkDir(src, func(p string, e fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		rel, _ := filepath.Rel(src, p)
		target := filepath.Join(dst, rel)
		if e.IsDir() {
			return os.MkdirAll(target, 0o755)
		}
		in, err := os.Open(p)
		if err != nil {
			return err
		}
		defer in.Close()
		out, err := os.Create(target)
		if err != nil {
			return err
		}
		defer out.Close()
		_, err = io.Copy(out, in)
		return err
	})
}

func build(dataPath, tplPath, staticDir, outDir string) error {
	d, err := load(dataPath)
	if err != nil {
		return err
	}
	tpl, err := template.ParseFiles(tplPath)
	if err != nil {
		return err
	}
	if err := os.MkdirAll(outDir, 0o755); err != nil {
		return err
	}
	f, err := os.Create(filepath.Join(outDir, "index.html"))
	if err != nil {
		return err
	}
	defer f.Close()
	if err := tpl.Execute(f, d); err != nil {
		return err
	}
	return copyDir(staticDir, outDir)
}

func main() {
	data := flag.String("data", "data.json", "content file")
	out := flag.String("out", "dist", "output dir")
	flag.Parse()
	if err := build(*data, "templates/index.html.tmpl", "static", *out); err != nil {
		log.Fatal(err)
	}
	log.Println("built ->", *out)
}
