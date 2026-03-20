// Dynamic Home Page Management
class HomePage {
constructor() {
this.examSelection = document.getElementById('exam-selection');
this.noExamsSection = document.getElementById('no-exams-section');
this.dropZone = document.getElementById('drop-zone');
this.browseButton = document.getElementById('browse-files');
this.fileInput = null;
this.currentExamInfo = document.getElementById('current-exam-info');
this.startExamCta = document.querySelector('.start-exam-cta');
this.modulesSection = document.getElementById('modules-section');
this.modulesList = document.getElementById('modules-list');
this.resourcesList = document.getElementById('resources-list');
this.heroImportBtn = document.getElementById('hero-import-btn');
this.addExamBtn = document.getElementById('add-exam-btn');
this.heroViewProgressBtn = document.getElementById('hero-view-progress');
this.heroManageExamsBtn = document.getElementById('hero-manage-exams');
this.previewActionBtn = document.getElementById('preview-action-btn');
this.previewActionLabel = this.previewActionBtn?.querySelector('span');
this.previewExamName = document.getElementById('preview-exam-name');
this.previewSubtitle = document.getElementById('preview-exam-subtitle');
this.previewStatusPill = document.getElementById('preview-status-pill');
this.previewLastScore = document.getElementById('preview-last-score');
this.previewLastDate = document.getElementById('preview-last-date');
this.previewBestScore = document.getElementById('preview-best-score');
this.previewBestExam = document.getElementById('preview-best-exam');
this.previewTimeSpent = document.getElementById('preview-time-spent');
this.previewPassRate = document.getElementById('preview-pass-rate');
this.previewHighlights = document.getElementById('preview-highlights');
this.activeExamsCount = document.getElementById('active-exams-count');
this.totalQuestionsCount = document.getElementById('total-questions-count');
this.imageSupportFlag = document.getElementById('image-support-flag');
this.selectedExamId = null;
this.availableExams = new Map();

this.init();
}

async init() {
await this.loadAvailableExams();
this.setupEventListeners();
this.setupConfigModal();
this.refreshHeroPreview();
}

async loadAvailableExams() {
try {
const exams = await window.examManager.detectAvailableExams();
this.availableExams = exams;
console.log('Detected exams:', exams.size, 'exams');
console.log('Exam IDs:', Array.from(exams.keys()));
console.log('All window.userExams:', window.userExams ? Object.keys(window.userExams) : []);
console.log('Active exams:', window.examManager.getActiveExamIds());
this.renderExamCards(exams);
this.updateHeroStats(exams);
if (this.selectedExamId && !exams.has(this.selectedExamId)) {
	this.selectedExamId = null;
}
this.refreshHeroPreview();
} catch (error) {
console.error('Failed to load exams:', error);
this.showNoExamsSection();
this.updateHeroStats(new Map());
}
}

renderExamCards(exams) {
if (exams.size === 0) {
this.showNoExamsSection();
return;
}

// Hide "No Exams" section and show exam cards
this.hideNoExamsSection();
this.examSelection.innerHTML = '';

const fragment = document.createDocumentFragment();
exams.forEach((examData, examId) => {
const card = this.createExamCard(examId, examData);
fragment.appendChild(card);
});
this.examSelection.appendChild(fragment);

// Show compact import button when exams exist
this.showCompactImportButton();
}

updateHeroStats(exams) {
const activeCount = exams.size;
let totalQuestions = 0;
let hasImages = false;

exams.forEach((examData) => {
const metadata = examData.metadata || {};
totalQuestions += metadata.questionCount || metadata.totalQuestions || 0;
if (examData.hasImages) {
	hasImages = true;
}
});

if (this.activeExamsCount) {
this.activeExamsCount.textContent = activeCount;
}
if (this.totalQuestionsCount) {
this.totalQuestionsCount.textContent = totalQuestions || '—';
}
if (this.imageSupportFlag) {
this.imageSupportFlag.textContent = hasImages ? 'Images detected' : 'Auto-detecting';
this.imageSupportFlag.classList.toggle('has-images', hasImages);
}
}

createExamCard(examId, examData) {
const metadata = examData.metadata;
const questionCount = metadata.questionCount || 45;
const totalQuestions = metadata.totalQuestions || questionCount;

const card = document.createElement('div');
card.className = `exam-card ${this.getCardClass(examId)}`;
card.dataset.exam = examId;

card.innerHTML = `
<button class="exam-delete" title="Hide exam">
	<i aria-hidden="true" class="fas fa-eye-slash"></i>
</button>
<div class="exam-badge">${metadata.badge || 'Custom'}</div>
<i class="${metadata.icon || 'fas fa-book'} exam-icon"></i>
<div class="exam-title">${metadata.name || examId.toUpperCase()}</div>
<div class="exam-subtitle">${metadata.fullName || 'Custom Exam'}</div>
<div class="exam-stats">
	<div class="exam-stat">
		<span class="exam-stat-number">${questionCount}</span>
		<span class="exam-stat-label">Questions</span>
	</div>
	<div class="exam-stat">
		<span class="exam-stat-number">${metadata.duration || 45}</span>
		<span class="exam-stat-label">Minutes</span>
	</div>
	<div class="exam-stat">
		<span class="exam-stat-number">${metadata.passScore || 75}%</span>
		<span class="exam-stat-label">Pass Score</span>
	</div>
</div>
${totalQuestions > questionCount ? `<div class="exam-total-info">From ${totalQuestions} total questions</div>` : ''}
${examData.hasImages ? '<div class="exam-feature"><i aria-hidden="true" class="fas fa-images"></i> With Images</div>' : ''}
`;

// Bind deactivate button via addEventListener instead of inline onclick
const deleteBtn = card.querySelector('.exam-delete');
if (deleteBtn) {
deleteBtn.addEventListener('click', (e) => {
	e.stopPropagation();
	homepage.deactivateExam(examId);
});
}

card.addEventListener('click', (e) => {
if (!e.target.closest('.exam-delete')) {
	this.selectExam(examId);
}
});

return card;
}

getCardClass(examId) {
return 'custom';
}

selectExam(examId) {
// Update the global exam simulator with the selected exam
if (window.examSimulator) {
window.examSimulator.currentExam = examId;

// Load exam data into the simulator
const examData = window.userExams[examId];
if (examData) {
	window.examSimulator.examData[examId] = {
		name: examData.metadata.name,
		fullName: examData.metadata.fullName,
		duration: examData.metadata.duration,
		questionCount: examData.metadata.questionCount,
		passScore: examData.metadata.passScore,
		questions: examData.questions,
		modules: examData.metadata.modules || []
	};
}
}

// Always update UI regardless of examSimulator state
this.selectedExamId = examId;
this.highlightSelectedCard(examId);
this.showExamDetailsPlaceholder(examId);
this.refreshHeroPreview();
}

showExamInfo(examId) {
const examData = window.userExams[examId];
if (!examData) return;
const metadata = examData.metadata || {};

const durationEl = document.getElementById('exam-duration');
const questionsEl = document.getElementById('exam-questions');
const passScoreEl = document.getElementById('exam-pass-score');
const imagesEl = document.getElementById('exam-images');

document.getElementById('current-exam-name').textContent = metadata.name || examId.toUpperCase();
if (durationEl) durationEl.textContent = `${metadata.duration || 45} minutes`;
if (questionsEl) questionsEl.textContent = `${metadata.questionCount || examData.questions.length} questions`;
if (passScoreEl) passScoreEl.textContent = `${metadata.passScore || 70}%`;
if (imagesEl) {
imagesEl.textContent = examData.hasImages ? 'Includes images' : 'No images detected';
imagesEl.classList.toggle('has-images', !!examData.hasImages);
}

if (this.currentExamInfo) this.currentExamInfo.style.display = 'block';
if (this.startExamCta) this.startExamCta.style.display = 'block';

this.renderModules(metadata.modules);
this.renderResources(metadata.resources);
}

renderModules(modules) {
if (!this.modulesSection || !this.modulesList) return;
if (Array.isArray(modules) && modules.length > 0) {
this.modulesSection.style.display = 'block';
this.modulesList.innerHTML = modules.map(module => {
	if (typeof module === 'string') {
		return `<li><i aria-hidden="true" class="fas fa-check-circle"></i> ${module}</li>`;
	}
	const icon = module.icon || 'fas fa-check-circle';
	const name = module.name || module;
	return `<li><i class="${icon}"></i> ${name}</li>`;
}).join('');
} else {
this.modulesSection.style.display = 'none';
this.modulesList.innerHTML = '';
}
}

renderResources(resources) {
if (!this.resourcesList) return;
if (Array.isArray(resources) && resources.length > 0) {
this.resourcesList.innerHTML = resources.map(resource => {
	const icon = resource.icon || 'fas fa-link';
	const name = resource.name || 'Reference';
	const url = resource.url || '#';
	return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="resource-link"><i class="${icon}"></i> ${name}</a>`;
}).join('');
} else {
this.resourcesList.innerHTML = '<p class="muted">Add resource links in metadata to show quick shortcuts.</p>';
}
}

highlightSelectedCard(examId) {
document.querySelectorAll('.exam-card').forEach(card => {
card.classList.toggle('selected', card.dataset.exam === examId);
});
}

showExamDetailsPlaceholder(examId) {
const examData = window.userExams[examId];
if (!examData) return;

const metadata = examData.metadata || {};
const stats = this.getProgressStats(examId);
const placeholder = document.getElementById('exam-details-placeholder');

// Populate details
document.getElementById('details-exam-name').textContent = metadata.name || examId.toUpperCase();
document.getElementById('details-exam-subtitle').textContent = metadata.fullName || 'Practice exam';
document.getElementById('details-exam-duration').textContent = `${metadata.duration || 45} min`;
document.getElementById('details-exam-questions').textContent = `${metadata.questionCount || examData.questions.length}`;
document.getElementById('details-exam-pass-score').textContent = `${metadata.passScore || 70}%`;
document.getElementById('details-exam-images').textContent = examData.hasImages ? 'Yes' : 'No';

// Populate progress
document.getElementById('details-total-attempts').textContent = stats?.attempts || 0;
document.getElementById('details-best-score').textContent = stats?.bestScore ? `${stats.bestScore}%` : '—';
document.getElementById('details-pass-rate').textContent = stats?.passRate != null ? `${stats.passRate}%` : '—';

// Populate modules and resources
const modulesSection = document.getElementById('details-modules-section');
const modulesList = document.getElementById('details-modules-list');
const resourcesList = document.getElementById('details-resources-list');

if (metadata.modules && metadata.modules.length > 0) {
modulesSection.style.display = 'block';
modulesList.innerHTML = metadata.modules.map(module => {
	if (typeof module === 'string') {
		return `<li>${module}</li>`;
	}
	return `<li>${module.name || module}</li>`;
}).join('');

if (metadata.resources && metadata.resources.length > 0) {
	resourcesList.innerHTML = metadata.resources.map(resource => {
		const icon = resource.icon || 'fas fa-link';
		const name = resource.name || 'Reference';
		const url = resource.url || '#';
		return `<a href="${url}" target="_blank" rel="noopener noreferrer"><i class="${icon}"></i> ${name}</a>`;
	}).join('');
} else {
	resourcesList.innerHTML = '<p style="color:#999;font-size:0.9rem;">No resources available</p>';
}
} else {
modulesSection.style.display = 'none';
}

// Setup start button
const startBtn = document.getElementById('details-start-exam');
startBtn.onclick = () => {
document.getElementById('start-exam')?.click();
};

// Setup close button
const closeBtn = document.getElementById('btn-close-details');
closeBtn.onclick = () => {
placeholder.classList.remove('visible');
};

// Show placeholder and scroll
placeholder.classList.add('visible');
setTimeout(() => {
placeholder.scrollIntoView({ behavior: 'smooth', block: 'start' });
}, 100);
}

handlePreviewAction() {
if (this.selectedExamId) {
document.getElementById('start-exam')?.click();
} else {
this.scrollToExamLibrary();
}
}

scrollToExamLibrary() {
const library = document.querySelector('.exam-library');
if (library) {
library.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
}

refreshHeroPreview() {
if (!this.previewExamName) return;
const fallbackExamId = this.getMostRecentExamWithProgress();
const examId = this.selectedExamId || fallbackExamId;
const examData = examId ? (this.availableExams.get(examId) || window.userExams[examId]) : null;
const metadata = examData?.metadata || {};
const stats = examId ? this.getProgressStats(examId) : null;

if (examData) {
this.previewExamName.textContent = metadata.name || examId.toUpperCase();
this.previewSubtitle.textContent = metadata.fullName || 'Ready when you are.';
if (stats) {
	this.previewLastScore.textContent = `${stats.lastScore}%`;
	this.previewLastDate.textContent = stats.lastDate ? `Last attempt ${this.formatRelativeDate(stats.lastDate)}` : 'Recent attempt';
	this.previewBestScore.textContent = stats.bestScore ? `${stats.bestScore}%` : '—';
	this.previewBestExam.textContent = `${stats.attempts} attempt${stats.attempts === 1 ? '' : 's'}`;
	this.previewTimeSpent.textContent = this.formatDuration(stats.avgTime);
	this.previewPassRate.textContent = stats.passRate != null ? `Pass rate ${stats.passRate}%` : 'Pass rate —';
	if (this.previewStatusPill) {
		this.previewStatusPill.innerHTML = stats.passRate >= 70 ? '<i aria-hidden="true" class="fas fa-check"></i> On track' : '<i aria-hidden="true" class="fas fa-flag"></i> Keep practicing';
		this.previewStatusPill.classList.toggle('success', stats.passRate >= 70);
		this.previewStatusPill.classList.toggle('warning', stats.passRate >= 70 ? false : !!stats.attempts);
	}
} else {
	this.previewLastScore.textContent = '—';
	this.previewLastDate.textContent = 'No attempts yet';
	this.previewBestScore.textContent = '—';
	this.previewBestExam.textContent = 'No sessions yet';
	this.previewTimeSpent.textContent = '—';
	this.previewPassRate.textContent = 'Pass rate —';
	if (this.previewStatusPill) {
		this.previewStatusPill.classList.remove('success', 'warning');
		this.previewStatusPill.innerHTML = '<i aria-hidden="true" class="fas fa-hourglass-half"></i> Waiting for attempts';
	}
}
this.updatePreviewHighlights(metadata, examData);
} else {
this.previewExamName.textContent = 'You\'re ready to practice';
this.previewSubtitle.textContent = 'Import an exam pack or open the editor to get started.';
this.previewLastScore.textContent = '—';
this.previewLastDate.textContent = 'No attempts yet';
this.previewBestScore.textContent = '—';
this.previewBestExam.textContent = '—';
this.previewTimeSpent.textContent = '—';
this.previewPassRate.textContent = 'Pass rate —';
if (this.previewStatusPill) {
	this.previewStatusPill.classList.remove('success', 'warning');
	this.previewStatusPill.innerHTML = '<i aria-hidden="true" class="fas fa-hourglass-half"></i> Waiting for attempts';
}
if (this.previewHighlights) {
	this.previewHighlights.innerHTML = '<span class="flag-chip">Import exams to begin</span><span class="flag-chip">Track progress per exam</span><span class="flag-chip">Detailed analysis unlocked</span>';
}
}

if (this.previewActionLabel) {
this.previewActionLabel.textContent = this.selectedExamId ? 'Start practice now' : 'Browse exam library';
}
}

updatePreviewHighlights(metadata, examData) {
if (!this.previewHighlights) return;
const chips = [];
const questionCount = metadata.questionCount || examData?.questions?.length;
const duration = metadata.duration || 0;
if (questionCount) chips.push(`${questionCount} questions`);
if (duration) chips.push(`${duration} minutes`);
if (metadata.modules?.length) chips.push(`${metadata.modules.length} modules`);
if (examData?.hasImages) chips.push('Includes images');
if (chips.length === 0) chips.push('Import data to unlock stats');
this.previewHighlights.innerHTML = chips.map(chip => `<span class="flag-chip">${chip}</span>`).join('');
}

getProgressStats(examId) {
try {
const raw = localStorage.getItem(`${examId}_progress`);
if (!raw) return null;
const progress = JSON.parse(raw);
if (!progress?.attempts?.length) return null;
const attempts = progress.attempts;
const lastAttempt = attempts[attempts.length - 1];
const avgTime = attempts.reduce((sum, attempt) => sum + (attempt.timeSpent || 0), 0) / attempts.length;
const passRate = attempts.length ? Math.round(((progress.totalPassed || 0) / attempts.length) * 100) : null;
return {
	attempts: attempts.length,
	lastScore: lastAttempt.score,
	lastDate: lastAttempt.date,
	bestScore: progress.bestScore || lastAttempt.score,
	avgTime,
	passRate
};
} catch (error) {
console.warn('Failed to parse progress stats for', examId, error);
return null;
}
}

getMostRecentExamWithProgress() {
let latestExamId = null;
let latestDate = 0;

for (let i = 0; i < localStorage.length; i++) {
const key = localStorage.key(i);
if (key && key.endsWith('_progress')) {
	try {
		const progress = JSON.parse(localStorage.getItem(key));
		const attempts = progress?.attempts;
		if (attempts && attempts.length) {
			const lastDate = new Date(attempts[attempts.length - 1].date).getTime();
			if (lastDate > latestDate) {
				latestDate = lastDate;
				latestExamId = key.replace('_progress', '');
			}
		}
	} catch (error) {
		// ignore invalid entries
	}
}
}

return latestExamId;
}

formatRelativeDate(dateString) {
if (!dateString) return '';
const date = new Date(dateString);
if (Number.isNaN(date.getTime())) return '';
const diffMs = Date.now() - date.getTime();
const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
if (diffDays <= 0) return 'today';
if (diffDays === 1) return 'yesterday';
if (diffDays < 7) return `${diffDays} days ago`;
return date.toLocaleDateString();
}

formatDuration(minutes) {
if (!minutes || Number.isNaN(minutes)) return '—';
return `${Math.round(minutes)} min`;
}

showNoExamsSection() {
this.examSelection.style.display = 'none';
this.noExamsSection.style.display = 'block';
}

hideNoExamsSection() {
this.examSelection.style.display = '';
this.noExamsSection.style.display = 'none';
}

showCompactImportButton() {
// Check if button already exists
if (document.getElementById('compact-import-btn')) return;

// Create compact import button/card
const importCard = document.createElement('div');
importCard.id = 'compact-import-btn';
importCard.className = 'exam-card custom';
importCard.style.cssText = 'background:linear-gradient(135deg, #28a745 0%, #20c997 100%);cursor:pointer;min-width:280px;';

importCard.innerHTML = `
<div class="exam-badge">Import</div>
<i aria-hidden="true" class="fas fa-cloud-upload-alt exam-icon"></i>
<div class="exam-title">Import Exam</div>
<div class="exam-subtitle">Add new exam packs</div>
<div class="exam-stats">
	<div class="exam-stat">
		<span class="exam-stat-label">Drag & Drop</span>
	</div>
	<div class="exam-stat">
		<span class="exam-stat-label">or Browse</span>
	</div>
</div>
`;

// Add click handler
importCard.addEventListener('click', () => {
this.triggerFileImport();
});

// Add drag & drop to this card too
importCard.addEventListener('dragover', (e) => {
e.preventDefault();
e.stopPropagation();
importCard.classList.add('drag-over');
});

importCard.addEventListener('dragleave', (e) => {
e.stopPropagation();
importCard.classList.remove('drag-over');
});

importCard.addEventListener('drop', (e) => {
e.preventDefault();
e.stopPropagation();
importCard.classList.remove('drag-over');
document.body.classList.remove('dragging-file');
this.handleFiles(e.dataTransfer.files);
});					// Insert as first card
this.examSelection.insertBefore(importCard, this.examSelection.firstChild);
}

triggerFileImport() {
if (!this.fileInput) {
this.fileInput = document.createElement('input');
this.fileInput.type = 'file';
this.fileInput.accept = '.json,.zip';
this.fileInput.multiple = true;
this.fileInput.style.display = 'none';
document.body.appendChild(this.fileInput);
}

this.fileInput.onchange = (e) => {
this.handleFiles(e.target.files);
};

this.fileInput.click();
}

setupEventListeners() {
// Drag & Drop on drop zone
this.dropZone.addEventListener('dragover', (e) => {
e.preventDefault();
this.dropZone.classList.add('drag-over');
});

this.dropZone.addEventListener('dragleave', () => {
this.dropZone.classList.remove('drag-over');
});

this.dropZone.addEventListener('drop', (e) => {
e.preventDefault();
this.dropZone.classList.remove('drag-over');
this.handleFiles(e.dataTransfer.files);
});

// Global drag & drop (anywhere on page)
document.body.addEventListener('dragenter', (e) => {
// Only add class if dragging files
if (e.dataTransfer && e.dataTransfer.types.includes('Files')) {
	document.body.classList.add('dragging-file');
}
});

document.body.addEventListener('dragover', (e) => {
e.preventDefault();
e.dataTransfer.dropEffect = 'copy';
});

document.body.addEventListener('dragleave', (e) => {
// Only remove if leaving the entire page
if (e.target === document.body || !e.relatedTarget) {
	document.body.classList.remove('dragging-file');
}
});

document.body.addEventListener('drop', (e) => {
document.body.classList.remove('dragging-file');
// Only handle if dropping on body or exam-selection area
if (e.target === document.body || e.target.closest('#exam-selection') || e.target.closest('.hero')) {
	e.preventDefault();
	this.handleFiles(e.dataTransfer.files);
}
});

// Browse files
this.browseButton.addEventListener('click', () => {
if (!this.fileInput) {
	this.fileInput = document.createElement('input');
	this.fileInput.type = 'file';
	this.fileInput.accept = '.json,.zip';
	this.fileInput.multiple = true;
	this.fileInput.style.display = 'none';
	document.body.appendChild(this.fileInput);
}

this.fileInput.onchange = (e) => {
	this.handleFiles(e.target.files);
};

this.fileInput.click();
});

// Drop zone click
this.dropZone.addEventListener('click', (e) => {
if (e.target === this.dropZone || e.target.closest('.drop-zone') && !e.target.closest('button')) {
	this.browseButton.click();
}
});

// Hero action buttons
this.heroImportBtn?.addEventListener('click', () => this.triggerFileImport());
this.addExamBtn?.addEventListener('click', () => this.triggerFileImport());

// Add Exam button drag & drop
if (this.addExamBtn) {
this.addExamBtn.addEventListener('dragover', (e) => {
	e.preventDefault();
	e.stopPropagation();
	this.addExamBtn.classList.add('drag-over');
});

this.addExamBtn.addEventListener('dragleave', (e) => {
	e.stopPropagation();
	this.addExamBtn.classList.remove('drag-over');
});

this.addExamBtn.addEventListener('drop', (e) => {
	e.preventDefault();
	e.stopPropagation();
	this.addExamBtn.classList.remove('drag-over');
	document.body.classList.remove('dragging-file');
	this.handleFiles(e.dataTransfer.files);
});
}

// Preview action
this.previewActionBtn?.addEventListener('click', () => this.handlePreviewAction());

// View progress
this.heroViewProgressBtn?.addEventListener('click', () => {
if (typeof window.showProgressStatistics === 'function') {
	window.showProgressStatistics();
}
});

// Manage exams
document.getElementById('hero-manage-exams')?.addEventListener('click', () => this.openConfigModal());
}

async handleFiles(files) {
for (const file of files) {
try {
	await this.importFile(file);
} catch (error) {
	console.error(`Failed to import ${file.name}:`, error);
	alert(`Failed to import ${file.name}: ${error.message}`);
}
}

// Refresh the exam list
await this.loadAvailableExams();
}

async importFile(file) {
const fileName = file.name.toLowerCase();

if (fileName.endsWith('.json')) {
await this.importJsonFile(file);
} else if (fileName.endsWith('.zip')) {
await this.importZipFile(file);
} else {
throw new Error('Unsupported file type. Please use .json or .zip files.');
}
}

async importJsonFile(file) {
const text = await file.text();
const data = JSON.parse(text);

// Determine exam ID from filename or data
let examId = file.name.replace(/\.(json|zip)$/i, '');
if (data.id) {
examId = data.id;
}

// Import the exam
await window.examManager.importExam(examId, data);

console.log(`Successfully imported exam: ${examId}`);
this.showNotification(`✅ Exam "${examId}" imported successfully!`);
}

async importZipFile(file) {
if (!window.JSZip) {
throw new Error('ZIP support is unavailable (JSZip not loaded).');
}

this.showImportProgress();
const zip = await JSZip.loadAsync(file);
const dumpEntry = this.findZipEntry(zip, /(^|\/)dump\.json$/i);
if (!dumpEntry) {
throw new Error('ZIP file missing dump.json.');
}

const dumpText = await dumpEntry.async('string');
const parsedDump = JSON.parse(dumpText);
let questions = Array.isArray(parsedDump) ? parsedDump : parsedDump.questions;
if (!Array.isArray(questions)) {
throw new Error('dump.json must contain an array of questions.');
}

let metadata = null;
const metadataEntry = this.findZipEntry(zip, /(^|\/)metadata\.json$/i);
if (metadataEntry) {
const metadataText = await metadataEntry.async('string');
metadata = JSON.parse(metadataText);
}

let examId = (metadata && metadata.id) || this.deriveExamIdFromZip(zip, file.name);
if (!examId) {
examId = file.name.replace(/\.zip$/i, '');
}

await window.examManager.importExam(examId, { questions, metadata });

// Extract images from ZIP to local directory
console.log(`🔍 Scanning ZIP for images in exam: ${examId}`);
const imageFiles = [];

zip.forEach((relativePath, entry) => {
if (entry.dir) return;
const normalized = relativePath.toLowerCase();
if (normalized.match(/\.(jpg|jpeg|png|gif|svg|webp)$/i)) {
// Handle both forward slash and backslash (Windows ZIP paths)
const fileName = relativePath.replace(/\\/g, '/').split('/').pop();
imageFiles.push({ fileName, entry });
}
});

console.log(`📊 Found ${imageFiles.length} images in ZIP`);

if (imageFiles.length > 0 && window.imageStorage) {
console.log(`⏳ Storing ${imageFiles.length} images in IndexedDB...`);
this.updateImportProgress(0, imageFiles.length, 0);

let storedCount = 0;
for (const { fileName, entry } of imageFiles) {
try {
	// Extract as base64
	const base64Data = await entry.async('base64');
	const extension = fileName.split('.').pop().toLowerCase();
	const mimeType = {
		'jpg': 'image/jpeg',
		'jpeg': 'image/jpeg',
		'png': 'image/png',
		'gif': 'image/gif',
		'svg': 'image/svg+xml',
		'webp': 'image/webp'
	}[extension] || 'image/jpeg';
	
	await window.imageStorage.storeImage(examId, fileName, base64Data, mimeType);
	storedCount++;
	const percentage = (storedCount / imageFiles.length) * 100;
	this.updateImportProgress(storedCount, imageFiles.length, percentage);
	console.log(`✅ Stored ${fileName} (${(base64Data.length / 1024).toFixed(1)} KB)`);
} catch (err) {
	console.error(`❌ Failed to store ${fileName}:`, err);
}
}

console.log(`✅ Successfully stored ${storedCount}/${imageFiles.length} images in IndexedDB for ${examId}`);

// Keep progress modal visible for a moment to show completion
await new Promise(resolve => setTimeout(resolve, 800));
this.hideImportProgress();

this.showNotification(
`✅ Exam "${examId}" imported with ${storedCount} image(s) stored!`,
3000
);
} else if (imageFiles.length > 0) {
console.warn('⚠️ ImageStorage not available, images will not be stored');
this.hideImportProgress();
this.showNotification(`✅ Exam "${examId}" imported (images not stored)`);
} else {
this.hideImportProgress();
this.showNotification(`✅ Exam "${examId}" imported successfully!`);
}
}				findZipEntry(zip, pattern) {
let match = null;
zip.forEach((relativePath, entry) => {
if (!entry.dir && pattern.test(relativePath)) {
	if (!match || relativePath.length < match.name.length) {
		match = entry;
	}
}
});
return match;
}

deriveExamIdFromZip(zip, fallbackName) {
const rootFolders = new Set();
zip.forEach((relativePath) => {
const normalized = relativePath.replace(/^\/+/, '');
const [root] = normalized.split('/');
if (root) {
	rootFolders.add(root);
}
});
if (rootFolders.size === 1) {
return Array.from(rootFolders)[0];
}
return fallbackName ? fallbackName.replace(/\.zip$/i, '') : null;
}

async deleteExam(examId) {
// Confirm deletion
if (!confirm(`⚠️ Are you sure you want to completely remove exam "${examId}"?\n\nThis will delete:\n- All questions\n- All images\n- All progress\n\nThis action cannot be undone!`)) {
return;
}

// Remove from localStorage (correct keys)
localStorage.removeItem(`custom_${examId}_questions`);
localStorage.removeItem(`exam_metadata_${examId}`);
localStorage.removeItem(`exam_images_list_${examId}`);

// Remove from memory
if (window.userExams) {
delete window.userExams[examId];
}

// Delete images from IndexedDB
if (window.imageStorage) {
try {
	const count = await window.imageStorage.deleteExamImages(examId);
	console.log(`🗑️ Deleted ${count} images from IndexedDB`);
} catch (e) {
	console.warn(`⚠️ Failed to delete images:`, e.message);
}
}

// Remove from exam manager
if (window.examManager && window.examManager.exams) {
delete window.examManager.exams[examId];
}

await this.loadAvailableExams();

// Show notification
this.showNotification(`✅ Exam "${examId}" completely removed!`, 3000);

// Refresh modal if it's open
const modal = document.getElementById('exam-config-modal');
if (modal.style.display === 'flex') {
this.openConfigModal();
}
}

async deactivateExam(examId) {
window.examManager.deactivateExam(examId);
await this.loadAvailableExams();
this.showNotification(`Exam "${examId}" hidden from homepage.`, 2000);
}

showNotification(message, duration = 3000) {
// Simple notification (you can enhance this later)
const notif = document.createElement('div');
notif.style.cssText = 'position:fixed;top:20px;right:20px;background:#28a745;color:white;padding:15px 20px;border-radius:8px;z-index:9999;box-shadow:0 4px 6px rgba(0,0,0,0.1);max-width:400px;';
notif.textContent = message;
document.body.appendChild(notif);
setTimeout(() => notif.remove(), duration);
}

showImportProgress() {
const modal = document.getElementById('import-progress-modal');
if (modal) {
modal.classList.add('active');
this.updateImportProgress(0, 0, 0);
// Remove drag overlay when showing import progress
document.body.classList.remove('dragging-file');
document.body.classList.add('importing-exam');
}
}

hideImportProgress() {
const modal = document.getElementById('import-progress-modal');
if (modal) {
modal.classList.remove('active');
}
document.body.classList.remove('importing-exam');
}

updateImportProgress(current, total, percentage) {
const bar = document.getElementById('import-progress-bar');
const percentageText = document.getElementById('import-progress-percentage');
const countText = document.getElementById('import-progress-count');
const subtitle = document.getElementById('import-progress-subtitle');

if (bar) bar.style.width = percentage + '%';
if (percentageText) percentageText.textContent = Math.round(percentage) + '%';
if (countText) countText.textContent = `${current} / ${total} images`;

if (subtitle) {
if (current === 0 && total === 0) {
subtitle.textContent = 'Reading ZIP file...';
} else if (current < total) {
subtitle.textContent = 'Storing images in IndexedDB...';
} else {
subtitle.textContent = 'Import complete!';
}
}
}				setupConfigModal() {
const modal = document.getElementById('exam-config-modal');
const openBtn = document.getElementById('manage-exams-btn');
const closeBtn = document.getElementById('close-config-modal');

openBtn.addEventListener('click', () => this.openConfigModal());
closeBtn.addEventListener('click', () => this.closeConfigModal());

// Close on backdrop click
modal.addEventListener('click', (e) => {
if (e.target === modal) this.closeConfigModal();
});
}

openConfigModal() {
const modal = document.getElementById('exam-config-modal');
const list = document.getElementById('exam-config-list');

// Get ALL exams (active and inactive)
const allExamIds = window.examManager.getAllExamIds();

list.innerHTML = '';

if (allExamIds.length === 0) {
list.innerHTML = '<p style="text-align:center;color:#999;">No exams found in user-content/exams/</p>';
} else {
const configFragment = document.createDocumentFragment();
allExamIds.forEach(examId => {
	const isActive = window.examManager.isExamActive(examId);
	const examData = window.userExams[examId];
	const metadata = (examData && examData.metadata) ? examData.metadata : { name: examId, fullName: 'Unknown' };
	const hasImages = window.examImageFiles && window.examImageFiles[examId];
	const imageCount = hasImages ? Object.keys(window.examImageFiles[examId]).length : 0;

	const item = document.createElement('div');
	item.className = 'config-exam-item' + (isActive ? ' active' : '');

	item.innerHTML = `
		<div style="flex:1;">
			<div class="config-exam-name">${metadata.name || examId}</div>
			<div class="config-exam-desc">${metadata.fullName || 'Custom Exam'}</div>
			${imageCount > 0 ? `<div style="font-size:11px;color:#28a745;margin-top:4px;"><i aria-hidden="true" class="fas fa-images"></i> ${imageCount} images loaded</div>` : ''}
		</div>
		<div style="display:flex;align-items:center;gap:10px;">
			<label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
				<span class="config-exam-desc">${isActive ? 'Active' : 'Hidden'}</span>
				<input type="checkbox" ${isActive ? 'checked' : ''}
					style="width:20px;height:20px;cursor:pointer;">
			</label>
			<button class="config-delete-btn"
				style="background:#dc3545;color:white;border:none;padding:8px 12px;border-radius:6px;cursor:pointer;font-size:13px;display:flex;align-items:center;gap:6px;"
				title="Remove exam completely">
				<i aria-hidden="true" class="fas fa-trash"></i> Remove
			</button>
		</div>
	`;

	// Bind event listeners instead of inline onclick/onchange
	const checkbox = item.querySelector('input[type="checkbox"]');
	if (checkbox) {
		checkbox.addEventListener('change', function() {
			homepage.toggleExamActivation(examId, this.checked);
		});
	}
	const delBtn = item.querySelector('.config-delete-btn');
	if (delBtn) {
		delBtn.addEventListener('click', () => homepage.deleteExam(examId));
	}

	configFragment.appendChild(item);
});
list.appendChild(configFragment);
}

modal.style.display = 'flex';
}

closeConfigModal() {
document.getElementById('exam-config-modal').style.display = 'none';
}

async toggleExamActivation(examId, active) {
if (active) {
window.examManager.activateExam(examId);
} else {
window.examManager.deactivateExam(examId);
}

// Reload exam cards
await this.loadAvailableExams();

// Update the modal
this.openConfigModal();
}
}

// Initialize when page loads
let homepage;
document.addEventListener('DOMContentLoaded', async () => {
// Initialize exam images storage
if (!window.examImages) {
window.examImages = {};
}

// Wait for exam scripts to load first
if (window.examsLoadedPromise) {
await window.examsLoadedPromise;
}
homepage = new HomePage();
window.homepage = homepage;

// Bind progress buttons via addEventListener instead of inline onclick
document.getElementById('view-progress')?.addEventListener('click', () => {
if (typeof showProgressStatistics === 'function') showProgressStatistics();
});
document.getElementById('export-progress')?.addEventListener('click', () => {
if (typeof exportProgress === 'function') exportProgress();
});
});
