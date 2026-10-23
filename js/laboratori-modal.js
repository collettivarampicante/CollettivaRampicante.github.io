(function () {
    const el = (tag, props, parent) => Object.assign(parent.appendChild(document.createElement(tag)), props);

    const modal = document.createElement('div');
    modal.className = 'lab-modal';
    modal.hidden = true;
    modal.innerHTML = '<div class="lab-modal-box"><button class="lab-modal-close" aria-label="Chiudi">&times;</button><h2></h2><div></div></div>';
    document.body.appendChild(modal);
    const titolo = modal.querySelector('h2'), corpo = modal.querySelector('.lab-modal-box > div');

    const chiudi = () => { modal.hidden = true; document.body.style.overflow = ''; };
    modal.addEventListener('click', e => { if (e.target === modal || e.target.className === 'lab-modal-close') chiudi(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !document.querySelector('.lightbox')) chiudi(); });

    const urlFile = (cartella, f) => '../' + cartella + '/' + encodeURIComponent(f);

    document.querySelectorAll('.lab-event').forEach((evento, n) => {
        const h = evento.querySelector('h3');
        h.classList.add('lab-clickable');
        h.title = 'Apri foto, video e audio';
        h.addEventListener('click', () => {
            const cartella = 'images/media/LAB' + n;
            titolo.textContent = h.textContent.trim();
            corpo.textContent = 'Caricamento…';
            modal.hidden = false;
            document.body.style.overflow = 'hidden';

            listaFile(cartella).then(files => {
                corpo.textContent = '';
                const sezioni = [[EST_MEDIA.vid, 'Video'], [EST_MEDIA.aud, 'Audio'], [EST_MEDIA.img, 'Foto']];
                let griglia = null;

                sezioni.forEach(([re, nome]) => {
                    const lista = files.filter(f => re.test(f));
                    if (!lista.length) return;
                    el('h3', { textContent: nome }, corpo);
                    const isImg = re === EST_MEDIA.img;
                    const box = isImg ? (griglia = el('div', { className: 'gallery-grid' }, corpo)) : corpo;
                    lista.forEach(f => {
                        const url = urlFile(cartella, f);
                        if (isImg) {
                            const item = el('div', { className: 'gallery-item' }, box);
                            const img = el('img', { src: url, alt: f, loading: 'lazy' }, item);
                            // formato non visualizzabile dal browser (es. HEIC): mostra un link
                            img.onerror = () => {
                                item.replaceChildren();
                                el('a', { href: url, textContent: f, target: '_blank', rel: 'noopener' }, item);
                            };
                        }
                        else if (re === EST_MEDIA.vid) el('video', { src: url, controls: true, preload: 'metadata' }, box);
                        else el('audio', { src: url, controls: true, preload: 'none' }, box);
                    });
                });

                // Qualsiasi altro file (pdf, formati strani...) come link di download
                const altri = files.filter(f => !f.startsWith('.') && !sezioni.some(([re]) => re.test(f)));
                if (altri.length) {
                    el('h3', { textContent: 'Altri file' }, corpo);
                    const ul = el('ul', {}, corpo);
                    altri.forEach(f => el('a', { href: urlFile(cartella, f), textContent: f, target: '_blank', rel: 'noopener' }, el('li', {}, ul)));
                }

                if (!corpo.firstChild) corpo.textContent = 'Il materiale di questo laboratorio sarà caricato a breve.';
                if (griglia) setupGalleryLightbox(griglia);
            }).catch(() => { corpo.textContent = 'Impossibile caricare i materiali, riprova tra poco.'; });
        });
    });
})();