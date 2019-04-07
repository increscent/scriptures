const express = require('express');
const fs = require('fs');
const mustache = require('mustache');
const cookieParser = require('cookie-parser');
const toc = require('./toc.js');

const app = express();
const port = 1435;
const pageSize = 500; // characters per page

app.use(cookieParser());

app.get('/toc/:work/:book?', (req, res) =>
    renderToc(res, req.params.work, req.params.book));

app.get('/', (req, res) =>
    {
        if (req.cookies.lastVisited)
            res.redirect(req.cookies.lastVisited);
        else
            renderPage(res, 'bofm', '1-ne', '1');
    }
);

app.get('/:work/:book/:chapter/:verse?', (req, res) =>
    renderPage(res, req.params.work, req.params.book, req.params.chapter, req.params.verse));

app.listen(port, () => console.log(`Listening on port ${port}`));

function renderToc(res, work, book)
{
    try {
        book = book || '1-ne';
        var bookData = toc[work].books[book];
    } catch (e)
    {
        console.log(e);
        return res.send("Not found");
    }

    readFile('./views/toc.html')
    .then(tocView =>
        {
            var books = Object.values(toc[work].books)
                .map(x => ({...x, link: (x.chapters == 1) ? 
                    `/${work}/${x.abbr}/1` : `/toc/${work}/${x.abbr}`}));
            var chapters = [...Array(toc[work].books[book].chapters).keys()]
                .map(x => ({chapter: x+1, book}));

            res.send(mustache.render(tocView, {
                work,
                books,
                chapters,
            }));
        }
    )
    .catch(err => 
        {
            console.log(err);
            res.send("There was an error.");
        }
    );
}

function renderPage(res, work, book, chapter, verse)
{
    try {
        // make sure the input matches an existing work/book/chapter
        // this helps to guard against attacks
        chapter = parseInt(chapter);
        verse = verse ? parseInt(verse) : 1;
        var bookData = toc[work].books[book];
        if (chapter < 1 || chapter > bookData.chapters)
            throw null;
    } catch (e)
    {
        console.log(e);
        return res.send("Not found");
    }

    Promise.all([
        getChapterVerses(work, book, chapter),
        readFile('./views/chapter.html'),
        getNextVerse(toc, work, book, chapter, verse),
        getPrevVerse(toc, work, book, chapter, verse),
    ])
    .then(([chapterVerses, chapterView, next, prev]) =>
        {
            var [nextBook, nextChapter, nextVerse] = next;
            var [prevBook, prevChapter, prevVerse] = prev;

            if (verse > chapterVerses.length)
            {
                var [nextBook, nextChapter] = getNextChapter(toc, work, book, chapter);
                return res.redirect(`/${work}/${nextBook}/${nextChapter}`);
            }

            var verses = chapterVerses
                .map((x, i) => ({number: i+1, verse: x.verse}))
                .slice(verse-1, 
                    (nextVerse > verse) ? nextVerse-1 : chapterVerses.length);

            var nextLink = `/${work}/${nextBook}/${nextChapter}/${nextVerse}`;
            var prevLink = `/${work}/${prevBook}/${prevChapter}/${prevVerse}`;

            res.cookie('lastVisited', `/${work}/${book}/${chapter}/${verse}`);
            res.send(mustache.render(chapterView, {
                verses, 
                bookName: bookData.name,
                work,
                book,
                chapter,
                nextLink,
                prevLink,
            }));
        }
    )
    .catch(err =>
        {
            console.log(err);
            res.send("There was an error.");
        }
    );
}

function getNextVerse(toc, work, book, chapter, verse)
{
    return getChapterVerses(work, book, chapter)
    .then(chapterVerses =>
        {
            var limit = pageSize;
            var verseIndex = verse-1;
            var verses = 0;
            while (verseIndex < chapterVerses.length && limit > 0)
            {
                limit -= chapterVerses[verseIndex].verse.length;
                verses++;
                verseIndex++;
            }

            var nextVerse = verse + verses;
            var nextBook = book;
            var nextChapter = chapter;
            if (nextVerse > chapterVerses.length)
            {
                [nextBook, nextChapter] = getNextChapter(toc, work, book, chapter);
                nextVerse = 1;
            }

            return [nextBook, nextChapter, nextVerse];
        }
    );
}

function getPrevVerse(toc, work, book, chapter, verse)
{
    if (verse <= 1)
        [book, chapter] = getPrevChapter(toc, work, book, chapter);

    return getChapterVerses(work, book, chapter)
    .then(chapterVerses =>
        {
            var prevVerse; 

            if (verse <= 1)
            {
                // find the last page in the chapter
                var verseIndex = 0;
                var verses;
                while (verseIndex < chapterVerses.length)
                {
                    var limit = pageSize;
                    verses = 0;
                    while (verseIndex < chapterVerses.length && limit > 0)
                    {
                        limit -= chapterVerses[verseIndex].verse.length;
                        verses++;
                        verseIndex++;
                    }
                }

                prevVerse = chapterVerses.length+1 - verses;
            }
            else
            {
                // find the previous page in the chapter
                var limit = pageSize;
                var verseIndex = verse-1-1;
                var verses = 0;
                while (verseIndex >= 0 && limit > 0)
                {
                    limit -= chapterVerses[verseIndex].verse.length;
                    verses++;
                    verseIndex--;
                }

                prevVerse = verse - verses;
            }

            return [book, chapter, prevVerse];
        }
    );
}

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
        var nextBook = (bookIndex < 0) ? books[books.length-1] : books[bookIndex];
        return [nextBook, toc[work].books[nextBook].chapters];
    } else
    {
        return [book, chapter-1];
    }
}

function getChapterVerses(work, book, chapter)
{
    return readFile(`./${work}/${book}/${book}${chapter}`)
    .then(fileData => JSON.parse(fileData).verses.map((v, i) => ({number: i+1, verse: v})));
}

function readFile(filename)
{
    return new Promise((resolve, reject) =>
        {
            fs.readFile(filename, (err, data) =>
                {
                    if (err)
                        return reject(err);

                    resolve(data.toString());
                }
            );
        }
    );
}
