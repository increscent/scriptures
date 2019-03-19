const express = require('express');
const fs = require('fs');
const mustache = require('mustache');
const toc = require('./toc.js');

const app = express();
const port = 1435;
const pageSize = 500; // characters per page

app.get('/:work/:book/:chapter/:position?', (req, res) =>
    {
        try {
            // make sure the input matches an existing work/book/chapter
            // this helps to guard against attacks
            var work = req.params.work;
            var book = req.params.book;
            var chapter = parseInt(req.params.chapter);
            var position = req.params.position ? parseInt(req.params.position) : 0;
            var bookData = toc[work].books[book];
            if (chapter < 1 || chapter > bookData.chapters)
                throw null;
        } catch (e)
        {
            return res.send("Not found");
        }

//        console.log(Object.keys(toc[work].books));

        fs.readFile(`./${work}/${book}/${book}${chapter}`, (err, data) => 
            {
                if (err)
                    return res.send("File read error");

                var chapterData = JSON.parse(data.toString());
                var chapterView = fs.readFileSync('./views/chapter.html').toString();
                var chapterVerses = chapterData.verses.map((verse, i) => ({number: i+1, verse}));

                var verses = [];
                var limit = pageSize;
                for (var i = 0; i < chapterVerses.length; i++)
                {
                    var verse = chapterVerses[i].verse;
                    position -= verse.length;

                    if (position < 0)
                        verses.push(chapterVerses[i]);

                    limit -= verse.length;
                    
                    if (limit <= 0)
                        break;
                }

                res.send(mustache.render(chapterView, {
                    verses, 
                    book: bookData.name,
                    chapter,
                }));
            });
    });

app.listen(port, () => console.log(`Listening on port ${port}`));
