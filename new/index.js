const express = require('express');
const fs = require('fs');
const mustache = require('mustache');
const toc = require('./toc.js');

const app = express();
const port = 1435;
const pageSize = 700; // characters per page

app.get('/:work/:book/:chapter/:verse?', (req, res) =>
    {
        try {
            // make sure the input matches an existing work/book/chapter
            // this helps to guard against attacks
            var work = req.params.work;
            var book = req.params.book;
            var chapter = parseInt(req.params.chapter);
            var verse = req.params.verse ? parseInt(req.params.verse) : 1;
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
                var chapterVerses = chapterData.verses.map((v, i) => ({number: i+1, verse: v}));

                if (verse > chapterVerses.length)
                {
                    var [nextBook, nextChapter] = getNextChapter(toc, work, book, chapter);
                    return res.redirect(`/${work}/${nextBook}/${nextChapter}`);
                }

                var verses = [];
                var limit = pageSize;
                for (var i = verse-1; i < chapterVerses.length && limit > 0; i++)
                {
                    verses.push(chapterVerses[i]);
                    limit -= chapterVerses[i].verse.length;
                }

                var nextVerse = verse + verses.length;
                var nextBook = book;
                var nextChapter = chapter;
                if (nextVerse > chapterVerses.length)
                {
                    [nextBook, nextChapter] = getNextChapter(toc, work, book, chapter);
                    nextVerse = 1;
                }
                var nextLink = `/${work}/${nextBook}/${nextChapter}/${nextVerse}`;

                res.send(mustache.render(chapterView, {
                    verses, 
                    book: bookData.name,
                    chapter,
                    nextLink,
                }));
            });
    });

app.listen(port, () => console.log(`Listening on port ${port}`));

function getNextChapter(toc, work, book, chapter)
{
    var bookData = toc[work].books[book];
    if (chapter >= bookData.chapters)
    {
        var books = Object.keys(toc[work].books);
        var bookIndex = books.indexOf(book);
        bookIndex++;
        if (bookIndex >= books.length)
            return [books[0], 1];
        else
            return [books[bookIndex], 1];
    } else
    {
        return [book, chapter+1];
    }
}

function getPrevChapter(toc, work, book, chapter)
{
    var bookData = toc[work].books[book];
    if (chapter <= 1)
    {
        var books = Object.keys(toc[work].books);
        var bookIndex = books.indexOf(book);
        bookIndex--;
        if (bookIndex < 0)
            return [books[books.length-1], 1];
        else
            return [books[bookIndex], 1];
    } else
    {
        return [book, chapter-1];
    }
}
