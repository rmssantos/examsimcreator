// Função para carregar e cachear imagens locais
class ImageLoader {
    constructor() {
        this.baseUrl = './images/'; // Fallback para imagens antigas
        this.userContentBaseUrl = './user-content/exams/'; // Nova estrutura
        this.currentExam = null; // Will be set by exam loader
        this.cache = new Map();
        this.loadingPromises = new Map();
    }

    // Set current exam for dynamic path resolution
    setCurrentExam(examId) {
        this.currentExam = examId;
        console.log(`ImageLoader: Current exam set to ${examId}`);
    }

    async loadImage(filename) {
        // Se já está em cache, retornar
        if (this.cache.has(filename)) {
            return this.cache.get(filename);
        }

        // Se já está sendo carregada, esperar o promise existente
        if (this.loadingPromises.has(filename)) {
            return this.loadingPromises.get(filename);
        }

        // Criar novo promise de carregamento
        const loadPromise = this.loadLocalImage(filename);
        this.loadingPromises.set(filename, loadPromise);

        try {
            const imagePath = await loadPromise;
            this.cache.set(filename, imagePath);
            this.loadingPromises.delete(filename);
            return imagePath;
        } catch (error) {
            this.loadingPromises.delete(filename);
            console.warn(`Falha ao carregar imagem: ${filename}`, error);
            return null;
        }
    }

    async loadLocalImage(filename) {
        return new Promise((resolve, reject) => {
            const img = new Image();

            // Try user-content path first if exam is set
            let imagePath = this.baseUrl + filename; // Fallback
            if (this.currentExam) {
                imagePath = `${this.userContentBaseUrl}${this.currentExam}/images/${filename}`;
            }

            img.onload = () => {
                resolve(imagePath);
            };

            img.onerror = () => {
                // If user-content fails, try fallback to old images/ directory
                if (this.currentExam) {
                    const fallbackPath = this.baseUrl + filename;
                    const fallbackImg = new Image();
                    fallbackImg.onload = () => resolve(fallbackPath);
                    fallbackImg.onerror = () => reject(new Error(`Imagem não encontrada: ${filename}`));
                    fallbackImg.src = fallbackPath;
                } else {
                    reject(new Error(`Imagem não encontrada: ${filename}`));
                }
            };

            img.src = imagePath;
        });
    }

    // Pré-carrega uma lista de imagens
    async preloadImages(imageList) {
        console.log(`Pré-carregando ${imageList.length} imagens...`);
        
        const promises = imageList.map(filename => 
            this.loadImage(filename).catch(error => {
                console.warn(`Falha ao pré-carregar ${filename}:`, error);
                return null;
            })
        );

        const results = await Promise.all(promises);
        const loaded = results.filter(result => result !== null).length;
        
        console.log(`✓ ${loaded}/${imageList.length} imagens pré-carregadas`);
        return loaded;
    }
}

// Função para renderizar uma imagem na questão
function renderQuestionImage(imageFilename, altText = '', className = 'question-image') {
    if (!imageFilename) return '';

    // Determine image path based on current exam
    let imagePath = `./images/${imageFilename}`; // Fallback
    if (window.imageLoader && window.imageLoader.currentExam) {
        imagePath = `./user-content/exams/${window.imageLoader.currentExam}/images/${imageFilename}`;
    }

    // Fallback path for error handling
    const fallbackPath = `./images/${imageFilename}`;

    return `<img src="${imagePath}" alt="${altText}" class="${className}" style="max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 8px; margin: 15px auto; display: block; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" onerror="if(this.src !== '${fallbackPath}') { this.src = '${fallbackPath}'; } else { this.style.display='none'; this.insertAdjacentHTML('afterend', '<div class=\\'image-error\\' style=\\'color: #dc3545; text-align: center; padding: 20px; font-size: 14px;\\'><i class=\\'fas fa-exclamation-triangle\\' style=\\'font-size: 20px; margin-bottom: 8px;\\'></i><div>Imagem não disponível: ${imageFilename}</div></div>'); }">`;
}

// Função para processar texto da questão e renderizar imagens
function processQuestionContent(content) {
    // Regex para encontrar referências de imagem no formato ![](images/filename.jpg)
    const imageRegex = /!\[([^\]]*)\]\(images\/([^)]+)\)/g;
    
    return content.replace(imageRegex, (match, altText, filename) => {
        return renderQuestionImage(filename, altText, 'question-image');
    });
}

// Inicializar o carregador de imagens
window.imageLoader = new ImageLoader();

// CSS para os componentes de imagem
const imageStyles = `
<style>
.image-placeholder {
    background-color: #f8f9fa;
    border: 2px dashed #dee2e6;
    border-radius: 8px;
    padding: 40px;
    text-align: center;
    margin: 15px 0;
    min-height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.loading-spinner {
    color: #6c757d;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
}

.loading-spinner i {
    font-size: 24px;
    margin-bottom: 8px;
}

.image-error {
    color: #dc3545;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
}

.image-error i {
    font-size: 24px;
}

.question-image {
    max-width: 100%;
    height: auto;
    border: 1px solid #ddd;
    border-radius: 8px;
    margin: 15px 0;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.question-content img {
    display: block;
    margin: 15px auto;
}
</style>
`;

// Adicionar estilos ao documento
if (document.head) {
    document.head.insertAdjacentHTML('beforeend', imageStyles);
}

// Lista das imagens mais comuns do exame para pré-carregamento
const COMMON_EXAM_IMAGES = [
    '19601894-47fa-46fd-8628-00a836341cc5.jpg',
    '27b5c25c-f806-471f-ad25-c25850e9b842.jpg',
    '7411cdbf-8752-4aeb-954e-9dafb879ec3d.jpg',
    '6f222c79-9af1-491b-b912-171624dcada2.jpg',
    'e0a5954b-0869-45b4-84ba-5df92ce54baf.jpg',
    '042e16b6-a12f-4a4e-9614-4fdb042025f6.jpg'
];

// Função para inicializar o sistema de imagens
async function initializeImageSystem() {
    console.log('✓ Sistema de imagens inicializado (modo local)');
    
    // Testar carregamento de uma imagem
    const testImage = '19601894-47fa-46fd-8628-00a836341cc5.jpg';
    const img = new Image();
    img.onload = () => console.log('✓ Imagens carregando corretamente');
    img.onerror = () => console.warn('⚠ Algumas imagens podem não estar disponíveis');
    img.src = `./images/${testImage}`;
    
    return Promise.resolve();
}

// Exportar funções
window.ImageLoader = ImageLoader;
window.renderQuestionImage = renderQuestionImage;
window.processQuestionContent = processQuestionContent;
window.initializeImageSystem = initializeImageSystem;
