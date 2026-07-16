---
name: generate-crud-component
description: Generate crud component
---
You are and Agent that given the name of the component, help the user to generate the set of files needed for CRUD API.
If the user don't specify any component name, ask it.


Files to generate:

1. `beans/<Component-name>.java`: Empty file or if the user specify must contain field specified;
Follow this example: 
```java
package com.rmarcello.note.beans;

import java.util.List;

public class Note implements Comparable<Note> {
    private long id;
    private String title;
    private String content;
    private List<String> labels;
    private List<String> urls;
    private String color; // P9ed3

    public Note(long id, String title, String content, List<String> labels, List<String> urls, String color) { // Pbb5e
        this.id = id;
        this.title = title;
        this.content = content;
        if(labels == null) {
            this.labels = List.of();
        } else {
            this.labels = labels;
        }
        if(urls == null) {
            this.urls = List.of();
        } else {
            this.urls = urls;
        }
        this.color = color; // Pbb5e
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public List<String> getLabels() {
        return labels;
    }

    public void setLabels(List<String> labels) {
        this.labels = labels;
    }

    public List<String> getUrls() {
        return urls;
    }

    public void setUrls(List<String> urls) {
        this.urls = urls;
    }

    public String getColor() { // Pab1e
        return color;
    }

    public void setColor(String color) { // Pab1e
        this.color = color;
    }

    @Override
    public String toString() {
        return "Note{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", content='" + content + '\'' +
                ", labels=" + labels +
                ", urls=" + urls +
                ", color='" + color + '\'' + // Pd1a7
                '}';
    }

    @Override
    public int compareTo(Note other) {
        return this.title.compareTo(other.title);
    }
}

```

2. `controllers/<Component-name>Controller.java`: CRUD API for the component, must contain GET, POST, PUT, DELETE methods;
```java
package com.rmarcello.note.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rmarcello.note.beans.Note;
import com.rmarcello.note.service.NoteService;

import java.util.List;

@CrossOrigin(origins = "*", allowedHeaders = "*")
@RestController
@RequestMapping("/notes")
public class NoteController {

    @Autowired
    private NoteService noteService;

    @GetMapping
    public List<Note> getAllNotes() {
        return noteService.getAll();
    }

    @GetMapping("/{id}")
    public Note getNoteById(@PathVariable int id) {
        return noteService.getById(id);
    }

    @PostMapping
    public Note addNote(@RequestBody Note note) {
        return noteService.add(note);
    }

    @DeleteMapping("/{id}")
    public void removeNote(@PathVariable int id) {
        noteService.remove(id);
    }

    @GetMapping("/label/{label}")
    public List<Note> getNotesByLabel(@PathVariable String label) {
        return noteService.getByLabel(label);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Note> updateNote(@PathVariable int id, @RequestBody Note note) {
        Note updatedNote = noteService.update(id, note);
        if (updatedNote == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(updatedNote, HttpStatus.OK);
    }

}

```
3. `services/<Component-name>Service.java`: Service class for the component, must contain methods for CRUD operations;
```java
package com.rmarcello.note.service;

import org.springframework.stereotype.Service;

import com.rmarcello.note.beans.Note;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NoteService {



    public List<Note> getAll() {
        return null;
    }

    public Note getById(int id) {
        return null;
    }

    public Note add(Note note) {
        return null;
    }

    private long getNextId() {
        return 0;
    }

    public void remove(int id) {
        // no-op
    }

    public List<Note> getByLabel(String label) {
        return null;
    }

    public Note update(int id, Note updatedNote) {
        return null;
    }
}
```

