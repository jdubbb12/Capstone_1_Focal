<script setup>
import { computed, ref, nextTick } from 'vue'

// color palette
const PALETTE = [
  { circle: '#c57b43', tag: '#e29d70' }, // Terracotta Orange
  { circle: '#1f8e89', tag: '#54bdb7' }, // Teal
  { circle: '#c1ad4a', tag: '#d9c872' }  // Ochre Yellow
];

const canvasViewport = ref(null);
const draftInputRef = ref(null);

const searchQuery = ref('');
const activeFilter = ref('ALL');
const selectedId = ref(null);
const isStarred = ref(false);

// Inline Draft Pin State
const draftPin = ref(null);
const draftCategory = ref('LIGHTING');
const draftText = ref('');

// Inline Reply State
const replyingToId = ref(null);
const replyText = ref('');

// NOTE: Delete after implementing backend
const annotations = ref([
  {
    id: 1,
    number: 1,
    category: 'RIJSEFJI',
    text: 'JIOSEFJIO Ofe jfsejf iosejf opnefsp nfikosfnoseinosefn eofm iosjef jseiofjs oimsiof hnsiofnm eos hnfioejf oewjfo oin ios iosfo isjfoisejf iosjfo sfseif seofjesofkdl;skm opsejf',
    x: 15.2,
    y: 38.5,
    status: 'Status',
    colorIndex: 0
  },
]);

// NOTE: Extracts all distinct category names from existing pins
const uniqueCategories = computed(() => {
  const cats = new Set(annotations.value.map((a) => a.category));
  return Array.from(cats);
});

// NOTE: Filters both the 2d pins and the sidebar cards based on the selected category dropdown and the top search bar text
const filteredAnnotations = computed(() => {
  return annotations.value.filter((item) => {
    const matchesCategory =
      activeFilter.value === 'ALL' || item.category === activeFilter.value;
    const q = searchQuery.value.trim().toLowerCase();
    const matchesSearch =
      !q ||
      item.category.toLowerCase().includes(q) ||
      item.text.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });
});

function getPalette(colorIndex) {
  return PALETTE[colorIndex % PALETTE.length];
}

function selectAnnotation(id) {
  selectedId.value = id;
  draftPin.value = null;
}

// Keep the popover inside the canvas bounds even when clicking near edges
function getPopoverPosition(x, y) {
  const left = Math.min(Math.max(x, 18), 82);
  const top = y > 68 ? y - 28 : y + 8;
  return {
    left: `${left}%`,
    top: `${top}%`
  };
}

// NOTE: Converts the raw mouse pixel coords into percentages based on the canvas element's current width and height
async function handleCanvasClick(e) {
  const targetEl = canvasViewport.value || e.currentTarget;
  if (!targetEl) return;

  const rect = targetEl.getBoundingClientRect();
  const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
  const yPercent = ((e.clientY - rect.top) / rect.height) * 100;

  draftPin.value = {
    x: Number(xPercent.toFixed(1)),
    y: Number(yPercent.toFixed(1))
  };
  draftCategory.value = 'FEEDBACK';
  draftText.value = '';

  await nextTick();
  draftInputRef.value?.focus();
}

// SAVE NEW PIN: Commits the draft pin into the reactive annotations array, assigns the next
// sequential pin number, and highlights the newly created pin. 
function saveDraftPin() {
  if (!draftPin.value || !draftText.value.trim()) return;

  const nextNum = annotations.value.length + 1;
  const newPin = {
    id: Date.now(),
    number: nextNum,
    category: draftCategory.value.trim() || 'FEEDBACK',
    text: draftText.value.trim(),
    x: draftPin.value.x,
    y: draftPin.value.y,
    status: 'Status',
    colorIndex: (nextNum - 1) % PALETTE.length
  };

  annotations.value.push(newPin);
  selectedId.value = newPin.id;
  draftPin.value = null;
  draftText.value = '';
}

// NOTE: closes the draft pin popover and clears the input fields without saving
function cancelDraftPin() {
  draftPin.value = null;
  draftText.value = '';
}

// NOTE: Opens the inline reply input box for the selected annotation card.
function toggleReplyBox(id) {
  replyingToId.value = replyingToId.value === id ? null : id;
  replyText.value = '';
}

// NOTE: (NOT working rn) Adds a threaded reply to the target annotation card
function submitReply(id) {
  if (!replyText.value.trim()) return;
  const target = annotations.value.find((a) => a.id === id);
  if (target) {
    target.text += `\n\n↳ Reply: ${replyText.value.trim()}`;
  }
  replyingToId.value = null;
  replyText.value = '';
}

function handleStatusToggle(id) {
  const target = annotations.value.find((a) => a.id === id);
  if (target) {
    target.status = target.status === 'Status' ? 'Resolved ✓' : 'Status';
  }
}
</script>

<template>
<div class="focal-2d-root">  
  <!-- Top Search Bar Header -->
    <div class="d-flex flex-row justify-content-start align-items-center gap-3 px-4" style="background: #F5F3EB;">
        <RouterLink to="/feed" aria-label="FOCAL Home">
          <img height="72" src="/assets/img/Focal%20Logo.png" width="96" />
        </RouterLink>

        <div class="input-group rounded-pill flex-grow-1" style="border-width: 0px; border-color: var(--bs-secondary);">
        <input
          class="rounded-pill form-control"
          placeholder="Search..."
          style="border-width: 4px; border-color: #a6b793; max-width: 700px;"
          type="text"
        />
        <button class="btn btn-primary rounded-circle" style="background: #a6b793; border-width: 0px;" type="button">
          <i class="fas fa-search"></i>
        </button>
      </div>

      <button class="btn btn-primary" style="background: #465344; border-width: 0px;" type="button">
        Upload
      </button>

      <RouterLink :to="{ name: 'InspirationFeed' }" class="text-decoration-none" style="color: var(--bs-secondary);">
        Feed
      </RouterLink>
      <RouterLink :to="{ name: 'CreatorProfile' }" class="text-decoration-none" style="color: var(--bs-secondary);">
        Profile
      </RouterLink>

      <div class="dropdown">
        <button
          class="btn dropdown-toggle text-nowrap d-inline-flex align-items-center gap-2"
          type="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
          style="color: var(--bs-secondary); border: none;"
        >
          <i class="far fa-user"></i>
          @username
        </button>

        <ul class="dropdown-menu dropdown-menu-end">
          <li>
            <RouterLink
              class="dropdown-item"
              :to="{ name: 'EditProfile' }"
            >
              Edit Profile
            </RouterLink>
          </li>

          <li>
            <RouterLink
              class="dropdown-item"
              :to="{ name: 'BoardManagement' }"
            >
              Saved Boards
            </RouterLink>
          </li>

          <li>
            <hr class="dropdown-divider" />
          </li>

          <li>
            <button class="dropdown-item" type="button">
              Log Out
            </button>
          </li>
        </ul>
      </div>
  </div>    

    <!-- Main Workspace -->
    <main class="workspace">
      <!-- Left 2D Canvas Area (Art space)-->
      <section class="canvas-section">
        <div class="canvas-bezel">
          
          <!-- NOTE: @click="handleCanvasClick" captures clicks anywhere on the artwork.
            ref="canvasViewport" gives access to the DOM element's bounding box 
            so we can convert pixel clicks into responsive (X%, Y%) percentages. -->
          <div
            ref="canvasViewport"
            class="canvas-viewport"
            title="Click anywhere to drop a spatial pin"
            @click="handleCanvasClick"  
          >
            <!-- Spatial Annotation Pins -->
            <div
              v-for="item in filteredAnnotations"
              :key="item.id"
              class="spatial-pin"
              :class="{ active: selectedId === item.id }"
              :style="{
                left: `${item.x}%`,
                top: `${item.y}%`,
                backgroundColor: getPalette(item.colorIndex).circle
              }"
              @click.stop="selectAnnotation(item.id)"
            >
              <span>{{ item.number }}</span>
            </div>

          <!-- Draft Pin Marker & Inline Popover Form  -->
            <template v-if="draftPin">
              <div
                class="spatial-pin draft-marker"
                :style="{
                  left: `${draftPin.x}%`,
                  top: `${draftPin.y}%`,
                  backgroundColor: getPalette(annotations.length).circle
                }"
                @click.stop
              >
                <span>{{ annotations.length + 1 }}</span>
              </div>

              <div
                class="pin-popover"
                :style="getPopoverPosition(draftPin.x, draftPin.y)"
                @click.stop
              >
                <div class="popover-title">
                  New Pin #{{ annotations.length + 1 }} ({{ draftPin.x }}%, {{ draftPin.y }}%)
                </div>
                <input
                  v-model="draftCategory"
                  type="text"
                  class="popover-input"
                  placeholder="Category (e.g., LIGHTING, COLOR)"
                />
                <!-- NOTE: Pressing Enter saves the pin immediately; Shift+Enter adds a new line -->
                <textarea
                  ref="draftInputRef"
                  v-model="draftText"
                  rows="3"
                  class="popover-textarea"
                  placeholder="Write spatial feedback..."
                  @keydown.enter.exact.prevent="saveDraftPin"
                ></textarea>
                <div class="popover-actions">
                  <button type="button" class="btn-cancel" @click="cancelDraftPin">
                    Cancel
                  </button>
                  <button type="button" class="btn-save" @click="saveDraftPin">
                    Add Pin
                  </button>
                </div>
              </div>
            </template>

          </div>
        </div>

        <!-- Bottom Filter & Action Icons -->
        <div class="canvas-footer">
          <div class="filter-pill">
            <!-- NOTE: this will populate dropdown options from uniqueCategories computed property-->
            <select v-model="activeFilter">
              <option value="ALL">Filter</option>
              <option
                v-for="cat in uniqueCategories"
                :key="cat"
                :value="cat"
              >
                {{ cat }}
              </option>
            </select>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>

          <div class="footer-actions">
            <!-- Star / Save to Board Icon -->
            <button
              class="icon-btn"
              title="Save to Inspiration Board"
              @click="isStarred = !isStarred"
            >
              <svg
                width="23"
                height="23"
                viewBox="0 0 24 24"
                :fill="isStarred ? 'currentColor' : 'none'"
                stroke="currentColor"
                stroke-width="2"
                stroke-linejoin="round"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </button>

            <!-- Vertical More Dots Icon -->
            <button class="icon-btn" title="More Options">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="2"></circle>
                <circle cx="12" cy="12" r="2"></circle>
                <circle cx="12" cy="19" r="2"></circle>
              </svg>
            </button>
          </div>
        </div>
      </section>

      <!-- Right Spatial Annotations Sidebar -->
       <!-- NOTE: This displays critique cards synchronized with the 2D canvas pins -->
      <aside class="annotations-sidebar">
        <div class="sidebar-header">
          <h2>Spatial Annotations</h2>
          <button class="icon-btn" title="Annotation Layer Options">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#5a5a55">
              <circle cx="5" cy="12" r="2"></circle>
              <circle cx="12" cy="12" r="2"></circle>
              <circle cx="19" cy="12" r="2"></circle>
            </svg>
          </button>
        </div>

        <!-- Annotation Cards List -->
        <div class="cards-container">
          <div
            v-for="item in filteredAnnotations"
            :key="item.id"
            class="annotation-card"
            :class="{ 
              active: selectedId === item.id 
            }"
            @click="selectAnnotation(item)"
          >
            <span
              class="category-tag"
              :style="{ backgroundColor: getPalette(item.colorIndex).tag }"
            >
              [{{ item.number }}] {{ item.category }}
            </span>

            <p class="comment-body">{{ item.text }}</p>

            <!-- Inline Reply Input -->
            <div v-if="replyingToId === item.id" class="reply-box" @click.stop>
              <input
                v-model="replyText"
                type="text"
                placeholder="Write a reply..."
                @keydown.enter.prevent="submitReply(item.id)"
              />
              <button type="button" @click="submitReply(item.id)">Send</button>
            </div>

            <div class="card-footer">
              <button type="button" @click.stop="toggleReplyBox(item.id)">
                Reply
              </button>
              <button type="button" @click.stop="handleStatusToggle(item.id)">
                {{ item.status }}
              </button>
            </div>
          </div>
        </div>
      </aside>
    </main>
  </div>
</template>

<style scoped>

.focal-2d-root {
  --bg-header: #f2f1ed;
  --bg-search: #f5f5f5;
  --bg-main: #a6b793;
  --bg-frame: #bcbfb8;
  --bg-canvas: #f5f5f5;
  --bg-sidebar: #ccccc8;
  --bg-card: #f2f1ef;
  --bg-filter: #c2c6b9;
  --text-primary: #333330;
  --text-secondary: #5a5a55;

  background-color: var(--bg-main);
  color: var(--text-primary);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden; 
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}


/* 2. Main Split Layout */
.workspace {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 310px;
  height: calc(100vh - 82px);
}

/* 3. Left Column: Canvas Area */
.canvas-section {
  padding: 40px 44px 28px 44px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
}

.canvas-bezel {
  flex: 1;
  background-color: var(--bg-frame);
  border-radius: 30px;
  padding: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  min-height: 0;
}

.canvas-viewport {
  width: 100%;
  height: 100%;
  background-color: var(--bg-canvas);
  position: relative;
  overflow: hidden;
  cursor: crosshair;
  border: 1px solid #b5b7b0;
}

.wireframe-x {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.wireframe-x line {
  stroke: #bcbcbc;
  stroke-width: 1.2;
}

/* 4. Dual-Ring Spatial Annotation Pins */
.spatial-pin {
  position: absolute;
  transform: translate(-50%, -50%);
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  z-index: 10;
}

.spatial-pin:hover {
  transform: translate(-50%, -50%) scale(1.08);
}

.spatial-pin.active {
  transform: translate(-50%, -50%) scale(1.14);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.22);
}

.spatial-pin::after {
  content: "";
  position: absolute;
  inset: 5px;
  border-radius: 50%;
  border: 2.5px solid #ffffff;
  pointer-events: none;
}

.spatial-pin span {
  color: #ffffff;
  font-size: 32px;
  font-weight: 400;
  line-height: 1;
}


/* Inline Pin Creation Popover */
.pin-popover {
  position: absolute;
  transform: translateX(-50%);
  width: 240px;
  background-color: #f2f1ef;
  border: 1.5px solid #8c8e85;
  border-radius: 16px;
  padding: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.18);
  z-index: 30;
  display: flex;
  flex-direction: column;
  gap: 8px;
  cursor: default;
}

.popover-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
}

.popover-input,
.popover-textarea {
  width: 100%;
  background: #ffffff;
  border: 1px solid #bcbfb8;
  border-radius: 8px;
  padding: 6px 8px;
  font-size: 12px;
  color: var(--text-primary);
  outline: none;
}

.popover-actions {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
}

.btn-cancel,
.btn-save {
  border: none;
  border-radius: 8px;
  padding: 5px 10px;
  font-size: 12px;
  cursor: pointer;
}

.btn-cancel {
  background: #e2e3dc;
  color: var(--text-primary);
}

.btn-save {
  background: #333330;
  color: #ffffff;
  font-weight: 500;
}


/* Bottom Toolbar below Canvas */
.canvas-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 18px;
  padding: 0 4px;
}

.filter-pill {
  position: relative;
  background-color: var(--bg-filter);
  border-radius: 12px;
  width: 140px;
  height: 36px;
  display: flex;
  align-items: center;
  padding: 0 14px;
}

.filter-pill select {
  appearance: none;
  background: transparent;
  border: none;
  width: 100%;
  font-size: 13px;
  color: var(--text-primary);
  cursor: pointer;
  outline: none;
}

.filter-pill svg {
  width: 15px;
  height: 15px;
  position: absolute;
  right: 12px;
  pointer-events: none;
  color: var(--text-primary);
}

.footer-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #2f2f2c;
}

.icon-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: inherit;
  padding: 4px;
  border-radius: 6px;
}

.icon-btn:hover {
  background-color: rgba(0, 0, 0, 0.06);
}

/* 5. Right Column: Spatial Annotations Sidebar */
.annotations-sidebar {
  background-color: var(--bg-sidebar);
  padding: 22px 14px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  overflow-y: auto;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 6px;
}

.sidebar-header h2 {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
}

.cards-container {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.annotation-card {
  background-color: var(--bg-card);
  border-radius: 22px;
  padding: 18px 16px 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.15s ease, transform 0.15s ease;
}

.annotation-card:hover {
  transform: translateY(-1px);
}

.annotation-card.active {
  border-color: #555550;
}

.category-tag {
  display: inline-block;
  align-self: flex-start;
  font-size: 13px;
  font-weight: 500;
  color: #2b2b28;
  padding: 2px 6px;
  border-radius: 2px;
}

.comment-body {
  font-size: 13px;
  line-height: 1.38;
  color: #3d3d3a;
  word-break: break-word;
  white-space: pre-line;
}

.reply-box {
  display: flex;
  gap: 6px;
}

.reply-box input {
  flex: 1;
  font-size: 12px;
  padding: 5px 8px;
  border-radius: 6px;
  border: 1px solid #bcbfb8;
}

.reply-box button {
  font-size: 12px;
  padding: 5px 10px;
  background: #333330;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
  font-size: 13px;
  color: #333330;
}

.card-footer button {
  background: none;
  border: none;
  font-size: 13px;
  color: #333330;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 4px;
}

.card-footer button:hover {
  background-color: rgba(0, 0, 0, 0.07);
}
</style>
