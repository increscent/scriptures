const express = require('express');
const fs = require('fs');
const mustache = require('mustache');
const toc = require('./toc.js');

const app = express();
const port = 1435;

app.get('/:work/:book/:chapter', (req, res) =>
    {
        try {
            // make sure the input matches an existing work/book/chapter
            // this helps to guard against attacks
            var work = req.params.work;
            var book = req.params.book;
            var chapter = parseInt(req.params.chapter);
            var bookData = toc[work].books[book];
            if (chapter < 1 || chapter > bookData.chapters)
                throw null;
        } catch (e)
        {
            return res.send("Not found");
        }

        fs.readFile(`./${work}/${book}/${book}${chapter}`, (err, data) => 
            {
                if (err)
                    return res.send("File read error");

                var chapterData = JSON.parse(data.toString());
                var chapterView = fs.readFileSync('./views/chapter.html').toString();
                res.send(mustache.render(chapterView, {
                    verses: chapterData.verses.map((verse, i) => ({number: i+1, verse})),
                    book: bookData.name,
                    chapter,
                }));
            });
    });

app.listen(port, () => console.log(`Listening on port ${port}`));
