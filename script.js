/**
 * Masterway Energia Solar Digital - Interações GD
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Animação de Scroll (Header)
    const header = document.getElementById('main-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 3. Intersection Observer para Animações (data-aos) e Barras de Progresso
    const observerOptions = {
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Ativar animação geral (fade-up, etc)
                if (entry.target.hasAttribute('data-aos')) {
                    entry.target.classList.add('aos-animate');
                }
                
                // Ativar barras de progresso especificamente
                if (entry.target.classList.contains('vantagem-item')) {
                    const bar = entry.target.querySelector('.progress-bar');
                    const percent = entry.target.getAttribute('data-percent');
                    bar.style.setProperty('--final-width', percent + '%');
                    entry.target.classList.add('visible');
                }
            } else {
                // Resetar estado ao sair da tela para animação recorrente
                if (entry.target.classList.contains('vantagem-item')) {
                    entry.target.classList.remove('visible');
                }
                
                // Opcional: resetar AOS também se desejar animação completa repetida
                if (entry.target.hasAttribute('data-aos')) {
                    entry.target.classList.remove('aos-animate');
                }
            }
        });
    }, observerOptions);

    document.querySelectorAll('[data-aos]').forEach(el => observer.observe(el));
    document.querySelectorAll('.vantagem-item').forEach(el => observer.observe(el));

    // 3. Lógica do Formulário de Lead e Simulação
    const leadForm = document.getElementById('lead-form');
    
    if (leadForm) {
        leadForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const btn = leadForm.querySelector('button');
            // Coletar dados
            const formData = {
                tipoPessoa: leadForm.querySelector('input[name="tipo-pessoa"]:checked')?.value || 'pf',
                nome: document.getElementById('nome').value,
                email: document.getElementById('email')?.value || '',
                whatsapp: document.getElementById('whatsapp').value,
                cep: document.getElementById('cep')?.value || '',
                valorConta: parseFloat(document.getElementById('valor-conta').value) || 0
            };

            // Simular envio
            btn.innerHTML = `<span>Processando...</span>`;
            btn.disabled = true;
            btn.style.opacity = '0.7';

            setTimeout(() => {
                // Cálculo de economia (15% garantido no modelo GD)
                const economiaMensal = formData.valorConta * 0.15;
                const economiaAnual = economiaMensal * 12;

                // Feedback visual de sucesso
                leadForm.innerHTML = `
                    <div class="text-center space-y-8 animate-[fade-in_0.5s_ease-out]">
                        <div class="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/30">
                            <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" class="w-10 h-10">
                                <path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                        <div class="space-y-4">
                            <h3 class="text-3xl font-['Outfit'] font-black uppercase tracking-tighter">Parabéns, ${formData.nome}!</h3>
                            <p class="text-slate-400">Sua economia potencial é de <span class="text-emerald-500 font-bold">${economiaMensal.toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}</span> por mês!</p>
                            <div class="bg-white/5 p-6 rounded-2xl border border-white/10">
                                <p class="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Economia em 1 ano</p>
                                <p class="text-4xl font-black text-white">${economiaAnual.toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}</p>
                            </div>
                        </div>
                        <p class="text-sm text-slate-500">Um consultor entrará em contato em breve via WhatsApp para finalizar sua adesão digital.</p>
                        <button onclick="location.reload()" class="text-amber-500 hover:text-white font-bold uppercase tracking-widest text-xs transition-colors">Fazer nova simulação</button>
                    </div>
                `;
                
                console.log("LEAD CAPTURADO:", formData);
            }, 1500);
        });
    }

    // 4. Lógica do Formulário Flutuante (HERO) com IBGE API
    const heroEstado = document.getElementById('hero-estado');
    const heroCidade = document.getElementById('hero-cidade');
    const heroLeadForm = document.getElementById('hero-lead-form');

    if (heroEstado && heroCidade) {
        // Buscar estados
        // Estados disponíveis para atendimento
        const estadosPermitidos = ['BA', 'GO', 'PI', 'SP', 'MG', 'PR', 'MT', 'MS'];

        fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
            .then(response => response.json())
            .then(estados => {
                estados
                    .filter(estado => estadosPermitidos.includes(estado.sigla))
                    .forEach(estado => {
                        const option = document.createElement('option');
                        option.value = estado.sigla;
                        option.dataset.id = estado.id;
                        option.textContent = estado.nome;
                        option.className = 'bg-slate-900 text-white';
                        heroEstado.appendChild(option);
                    });
            })
            .catch(error => console.error('Erro ao buscar estados:', error));

        // Atualizar cidades quando estado mudar
        heroEstado.addEventListener('change', (e) => {
            const estadoId = e.target.options[e.target.selectedIndex].dataset.id;
            
            heroCidade.innerHTML = '<option value="" disabled selected>Carregando...</option>';
            heroCidade.disabled = true;

            fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estadoId}/municipios?orderBy=nome`)
                .then(response => response.json())
                .then(cidades => {
                    heroCidade.innerHTML = '<option value="" disabled selected>Selecione a cidade</option>';
                    cidades.forEach(cidade => {
                        const option = document.createElement('option');
                        option.value = cidade.nome;
                        option.textContent = cidade.nome;
                        option.className = 'bg-slate-900 text-white';
                        heroCidade.appendChild(option);
                    });
                    heroCidade.disabled = false;
                })
                .catch(error => {
                    console.error('Erro ao buscar cidades:', error);
                    heroCidade.innerHTML = '<option value="" disabled selected>Erro ao carregar</option>';
                });
        });
    }

    if (heroLeadForm) {
        heroLeadForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const btn = heroLeadForm.querySelector('button');
            const originalText = btn.innerHTML;
            
            const dados = {
                nome: document.getElementById('hero-nome').value,
                empresa: document.getElementById('hero-empresa').value,
                whatsapp: document.getElementById('hero-whatsapp').value,
                email: document.getElementById('hero-email').value,
                estado: document.getElementById('hero-estado').value,
                cidade: document.getElementById('hero-cidade').value,
                valorConta: document.getElementById('hero-valor-conta').value
            };

            btn.innerHTML = `Processando...`;
            btn.disabled = true;
            btn.style.opacity = '0.7';

            setTimeout(() => {
                const subject = encodeURIComponent(`Nova Análise de Energia - ${dados.nome}`);
                let body = `Nome: ${dados.nome}\n`;
                if(dados.empresa) body += `Empresa: ${dados.empresa}\n`;
                body += `WhatsApp: ${dados.whatsapp}\n`;
                body += `E-mail: ${dados.email}\n`;
                body += `Estado: ${dados.estado}\n`;
                body += `Cidade: ${dados.cidade}\n`;
                body += `Valor médio da conta: ${dados.valorConta}\n`;
                
                const mailtoLink = `mailto:contato@masterway.com.br?subject=${subject}&body=${encodeURIComponent(body)}`;
                window.location.href = mailtoLink;
                
                btn.innerHTML = `Pronto!`;
                setTimeout(() => {
                    heroLeadForm.reset();
                    if (heroCidade) {
                        heroCidade.innerHTML = '<option value="" disabled selected>Aguardando...</option>';
                        heroCidade.disabled = true;
                    }
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                    btn.style.opacity = '1';
                }, 3000);
            }, 800);
        });
    }

    // 5. Smooth Anchor Scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // 6. Accordion FAQ
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const button = item.querySelector('.faq-button');
        const content = item.querySelector('.faq-content');
        const icon = item.querySelector('svg');

        button.addEventListener('click', () => {
            const isOpen = content.style.maxHeight;

            // Fechar todos
            document.querySelectorAll('.faq-content').forEach(c => {
                c.style.maxHeight = null;
            });
            document.querySelectorAll('.faq-item svg').forEach(i => {
                i.style.transform = 'rotate(0deg)';
            });

            // Abrir o atual se não estava aberto
            if (!isOpen) {
                content.style.maxHeight = content.scrollHeight + "px";
                icon.style.transform = 'rotate(180deg)';
            }
        });
    });

});
