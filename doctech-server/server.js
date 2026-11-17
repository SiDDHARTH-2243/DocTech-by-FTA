const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const { PDFDocument, rgb } = require('pdf-lib');

const app = express();
app.use(cors({
    origin: [
        'https://doc-tech-by-fta.vercel.app',
        'http://localhost:4321',
        'http://localhost:3000',
        'http://127.0.0.1:4321',
        'http://127.0.0.1:3000',
    ],
}));

// Configure storage location for uploaded encrypted files
const upload = multer({ dest: 'uploads/' });

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Silently remove a file from disk (non-blocking). */
function cleanupFile(filePath) {
    fs.unlink(filePath, (err) => {
        if (err) console.error(`[SERVER] Cleanup failed for ${filePath}:`, err.message);
    });
}

// ── /api/unlock ──────────────────────────────────────────────────────────────

app.post('/api/unlock', upload.single('pdf'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

    const password = req.body.password;
    const inputPath = req.file.path;
    const outputPath = path.join('uploads', `unlocked_${req.file.filename}.pdf`);

    console.log(`[SERVER] Processing: ${req.file.originalname} (AES-256 Decryption Loop)`);

    // Instruct QPDF to strip restrictions and decrypt via safe array invocation
    const args = ['--decrypt', `--password=${password}`, inputPath, outputPath];

    execFile('qpdf', args, (error, stdout, stderr) => {
        if (error) {
            console.error('[SERVER] QPDF Exec Error:', stderr);
            cleanupFile(inputPath);
            return res.status(401).json({ error: 'Decryption failed. Incorrect password or invalid PDF structure.' });
        }

        // Transmit the decrypted binary file back to the client
        res.download(outputPath, req.file.originalname.replace('.pdf', '_unlocked_doctech.pdf'), (err) => {
            cleanupFile(inputPath);
            cleanupFile(outputPath);
            console.log(`[SERVER] Buffers cleared from local storage.`);
        });
    });
});

// ── /api/protect ─────────────────────────────────────────────────────────────

app.post('/api/protect', upload.single('pdf'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

    const password = req.body.password;
    if (!password) {
        cleanupFile(req.file.path);
        return res.status(400).json({ error: 'Password is required.' });
    }

    const inputPath = req.file.path;
    const outputPath = path.join('uploads', `locked_${req.file.filename}.pdf`);

    console.log(`[SERVER] Processing: ${req.file.originalname} (AES-256 Encryption Loop)`);

    // Instruct QPDF to apply AES-256 encryption (setting both user and owner passwords)
    const args = ['--encrypt', password, password, '256', '--', inputPath, outputPath];

    execFile('qpdf', args, (error, stdout, stderr) => {
        if (error) {
            console.error('[SERVER] QPDF Exec Error:', stderr);
            cleanupFile(inputPath);
            return res.status(500).json({ error: 'Encryption failed on server.' });
        }

        // Transmit the encrypted binary file back to the client
        res.download(outputPath, req.file.originalname.replace(/\.pdf$/i, '_locked_doctech.pdf'), (err) => {
            // Enforcement of local file security: Purge input and output data from disk immediately
            cleanupFile(inputPath);
            cleanupFile(outputPath);
            console.log(`[SERVER] Buffers cleared from local storage.`);
        });
    });
});

// ── /api/pdf2word ────────────────────────────────────────────────────────────

app.post('/api/pdf2word', upload.single('pdf'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

    const inputPath = req.file.path;
    const outputPath = path.join('uploads', `converted_${req.file.filename}.docx`);

    console.log(`[SERVER] Processing: ${req.file.originalname} (PDF to Word Engine)`);

    // Invoke pdf2docx globally from PATH — no hardcoded Python path
    const args = ['convert', inputPath, outputPath];

    execFile('pdf2docx', args, (error, stdout, stderr) => {
        if (error) {
            console.error('[SERVER] pdf2docx Exec Error:', stderr);
            cleanupFile(inputPath);
            return res.status(500).json({ error: 'Word conversion failed. Ensure Python and pdf2docx are installed.' });
        }

        // Transmit the rebuilt Word document back to the client
        res.download(outputPath, req.file.originalname.replace(/\.pdf$/i, '_doctech.docx'), (err) => {
            // Enforcement of local file security
            cleanupFile(inputPath);
            cleanupFile(outputPath);
            console.log(`[SERVER] Word document transmitted and buffers cleared.`);
        });
    });
});

// ── /api/word2pdf ────────────────────────────────────────────────────────────

app.post('/api/word2pdf', upload.single('word'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

    // Intelligently extract the original extension
    const originalPath = req.file.path;
    const ext = path.extname(req.file.originalname) || '.docx';
    const inputWithExt = originalPath + ext;

    fs.rename(originalPath, inputWithExt, (renameErr) => {
        if (renameErr) {
            console.error('[SERVER] Rename failed:', renameErr.message);
            cleanupFile(originalPath);
            return res.status(500).json({ error: 'Server file processing error.' });
        }

        // Get absolute paths
        const inputPath = path.resolve(inputWithExt);
        const outputDir = path.resolve('uploads');

        // LibreOffice automatically names the output file the same as the input file, but with .pdf
        const expectedOutputFile = path.join(outputDir, path.basename(inputWithExt, ext) + '.pdf');

        console.log(`[SERVER] Processing: ${req.file.originalname} (LibreOffice Headless Engine)`);

        // Invoke soffice globally from PATH — no hardcoded LibreOffice path
        const args = ['--headless', '--convert-to', 'pdf', inputPath, '--outdir', outputDir];

        execFile('soffice', args, (error, stdout, stderr) => {
            if (error) {
                console.error('[SERVER] LibreOffice Exec Error:', stderr || stdout);
                cleanupFile(inputWithExt);
                return res.status(500).json({ error: 'Conversion failed. Ensure LibreOffice is installed correctly.' });
            }

            res.download(expectedOutputFile, req.file.originalname.replace(/\.docx?$/i, '_doctech.pdf'), (err) => {
                // Buffer cleanup
                cleanupFile(inputWithExt);
                cleanupFile(expectedOutputFile);
                console.log(`[SERVER] PDF document transmitted and buffers cleared.`);
            });
        });
    });
});

// ── /api/compress ────────────────────────────────────────────────────────────

app.post('/api/compress', upload.single('pdf'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

    const quality = req.body.quality;
    let pdfSettings = '/screen'; // default to low quality / maximum compression
    if (quality === 'medium') {
        pdfSettings = '/ebook';
    } else if (quality === 'high') {
        pdfSettings = '/printer';
    }

    const inputPath = req.file.path;
    const outputPath = path.join('uploads', `compressed_${req.file.filename}.pdf`);

    console.log(`[SERVER] Processing: ${req.file.originalname} (Ghostscript Compression Engine - ${pdfSettings})`);

    // Invoke Ghostscript with dynamic quality preset
    const args = [
        '-sDEVICE=pdfwrite',
        '-dCompatibilityLevel=1.4',
        `-dPDFSETTINGS=${pdfSettings}`,
        '-dColorConversionStrategy=/LeaveColorUnchanged',
        '-dPrinted=false',
        '-dNOPAUSE',
        '-dQUIET',
        '-dBATCH',
        `-sOutputFile=${outputPath}`,
        inputPath
    ];

    execFile('gswin64c', args, (error, stdout, stderr) => {
        if (error) {
            console.error('[SERVER] Ghostscript Exec Error:', stderr || stdout);
            cleanupFile(inputPath);
            return res.status(500).json({ error: 'Compression failed. Ensure Ghostscript is installed correctly.' });
        }

        fs.stat(outputPath, (errOut, statsOut) => {
            if (errOut) {
                console.error('[SERVER] Output file stat error:', errOut.message);
                cleanupFile(inputPath);
                cleanupFile(outputPath);
                return res.status(500).json({ error: 'Failed to verify file sizes.' });
            }

            fs.stat(inputPath, (errIn, statsIn) => {
                if (errIn) {
                    console.error('[SERVER] Input file stat error:', errIn.message);
                    cleanupFile(inputPath);
                    cleanupFile(outputPath);
                    return res.status(500).json({ error: 'Failed to verify file sizes.' });
                }

                if (statsOut.size >= statsIn.size) {
                    console.log(`[SERVER] Compression gatekeeper triggered: Output (${statsOut.size}B) >= Input (${statsIn.size}B). Sending original.`);
                    res.download(inputPath, req.file.originalname, (err) => {
                        cleanupFile(inputPath);
                        cleanupFile(outputPath);
                        console.log(`[SERVER] Original PDF transmitted and buffers cleared.`);
                    });
                } else {
                    // Transmit the compressed PDF back to the client
                    res.download(outputPath, req.file.originalname.replace(/\.pdf$/i, '_compressed_doctech.pdf'), (err) => {
                        // Enforcement of local file security
                        cleanupFile(inputPath);
                        cleanupFile(outputPath);
                        console.log(`[SERVER] Compressed PDF transmitted and buffers cleared.`);
                    });
                }
            });
        });
    });
});

// ── /api/add-page-numbers ────────────────────────────────────────────────────

app.post('/api/add-page-numbers', upload.single('pdf'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

    const inputPath = req.file.path;
    const outputPath = path.join('uploads', `numbered_${req.file.filename}.pdf`);
    const position = req.body.position || 'center';

    console.log(`[SERVER] Processing: ${req.file.originalname} (Add Page Numbers)`);

    try {
        const pdfBytes = await fs.promises.readFile(inputPath);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const pages = pdfDoc.getPages();

        pages.forEach((page, index) => {
            const { width, height } = page.getSize();
            let x = width / 2;
            if (position === 'right') {
                x = width - 50;
            }

            page.drawText(String(index + 1), {
                x: x,
                y: 30,
                size: 12,
                color: rgb(0, 0, 0),
            });
        });

        const modifiedPdfBytes = await pdfDoc.save();
        await fs.promises.writeFile(outputPath, modifiedPdfBytes);

        res.download(outputPath, req.file.originalname.replace(/\.pdf$/i, '_numbered_doctech.pdf'), (err) => {
            cleanupFile(inputPath);
            cleanupFile(outputPath);
            console.log(`[SERVER] Numbered PDF transmitted and buffers cleared.`);
        });
    } catch (error) {
        console.error('[SERVER] Page Numbering Error:', error.message);
        cleanupFile(inputPath);
        return res.status(500).json({ error: 'Failed to add page numbers.' });
    }
});

// ── /api/fetch-image ─────────────────────────────────────────────────────────
// Streams a remote image back to the browser so cross-origin links (YouTube
// thumbnails, CDN image URLs) can be downloaded as a file. Basic SSRF guard.

app.get('/api/fetch-image', async (req, res) => {
    const target = req.query.url;
    if (!target || typeof target !== 'string') {
        return res.status(400).json({ error: 'Missing url parameter.' });
    }

    let parsed;
    try { parsed = new URL(target); } catch { return res.status(400).json({ error: 'Invalid URL.' }); }
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return res.status(400).json({ error: 'Only http/https URLs are allowed.' });
    }
    const host = parsed.hostname.toLowerCase();
    if (/^(localhost|127\.|0\.0\.0\.0|10\.|192\.168\.|169\.254\.|::1)/.test(host) ||
        /^172\.(1[6-9]|2[0-9]|3[01])\./.test(host) || host.endsWith('.local')) {
        return res.status(400).json({ error: 'That host is not allowed.' });
    }

    const MAX = 25 * 1024 * 1024;
    try {
        const upstream = await fetch(target, { headers: { 'User-Agent': 'Mozilla/5.0 DocTech' }, redirect: 'follow' });
        if (!upstream.ok) return res.status(502).json({ error: `Source responded ${upstream.status}.` });

        const type = upstream.headers.get('content-type') || 'application/octet-stream';
        if (!type.startsWith('image/')) return res.status(415).json({ error: 'That URL is not a direct image.' });
        if (Number(upstream.headers.get('content-length') || 0) > MAX) {
            return res.status(413).json({ error: 'Image is too large (max 25 MB).' });
        }

        const buf = Buffer.from(await upstream.arrayBuffer());
        if (buf.length > MAX) return res.status(413).json({ error: 'Image is too large (max 25 MB).' });

        const name = (parsed.pathname.split('/').pop() || 'image').replace(/[^a-zA-Z0-9._-]/g, '_') || 'image';
        res.setHeader('Content-Type', type);
        res.setHeader('Content-Disposition', `attachment; filename="${name}"`);
        console.log(`[SERVER] Proxied image: ${host} (${buf.length} bytes)`);
        res.send(buf);
    } catch (err) {
        console.error('[SERVER] fetch-image error:', err.message);
        res.status(500).json({ error: 'Failed to fetch the image.' });
    }
});

// ── Startup ──────────────────────────────────────────────────────────────────

fs.mkdir('uploads', { recursive: true }, (err) => {
    if (err) console.error('[SERVER] Could not create uploads directory:', err.message);
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 DocTech Engine online at http://localhost:${PORT}`);
});