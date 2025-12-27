<script setup>
import { onMounted, ref, computed } from "vue";

const loading = ref(true);
const errorText = ref("");
const tickets = ref([]);

const q = ref("");
const statusFilter = ref("ALL");

async function loadTickets() {
  loading.value = true;
  errorText.value = "";
  try {
    const r = await fetch("/api/tickets");
    const j = await r.json();
    if (!r.ok) throw new Error(j?.error || "Failed to load tickets");
    tickets.value = j.data || [];
  } catch (e) {
    errorText.value = e.message || String(e);
  } finally {
    loading.value = false;
  }
}

async function updateStatus(id, status) {
  try {
    const r = await fetch("/api/tickets", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    const j = await r.json();
    if (!r.ok) throw new Error(j?.error || "Failed to update");

    const idx = tickets.value.findIndex((t) => t.id === id);
    if (idx >= 0) tickets.value[idx] = j.data;
  } catch (e) {
    alert("خطا: " + (e.message || String(e)));
  }
}

const filtered = computed(() => {
  const qq = q.value.trim().toLowerCase();
  return tickets.value.filter((t) => {
    const okStatus = statusFilter.value === "ALL" ? true : (t.status === statusFilter.value);
    if (!okStatus) return false;

    if (!qq) return true;
    const blob = `${t.id} ${t.telegram_id} ${t.request_type} ${t.description} ${t.status}`.toLowerCase();
    return blob.includes(qq);
  });
});
</script>

<template>
  <div style="font-family:sans-serif; padding:16px; max-width:1100px; margin:0 auto;">
    <h2>🛠 پنل مدیریت تیکت‌ها</h2>

    <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center; margin:12px 0;">
      <input v-model="q" placeholder="جستجو..." style="padding:10px; border:1px solid #ddd; border-radius:10px; min-width:220px;" />
      <select v-model="statusFilter" style="padding:10px; border:1px solid #ddd; border-radius:10px;">
        <option value="ALL">همه</option>
        <option value="Pending">Pending</option>
        <option value="Done">Done</option>
        <option value="Rejected">Rejected</option>
      </select>
      <button @click="loadTickets" style="padding:10px 14px; border-radius:10px; border:0; cursor:pointer; font-weight:700;">
        رفرش
      </button>
    </div>

    <p v-if="errorText" style="color:#b00020; font-weight:700;">{{ errorText }}</p>
    <p v-if="loading">در حال لود...</p>

    <table v-if="!loading" style="width:100%; border-collapse:collapse; font-size:14px;">
      <thead>
        <tr style="text-align:left; border-bottom:1px solid #eee;">
          <th style="padding:10px;">ID</th>
          <th style="padding:10px;">Telegram ID</th>
          <th style="padding:10px;">Type</th>
          <th style="padding:10px;">Description</th>
          <th style="padding:10px;">Status</th>
          <th style="padding:10px;">Image</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="t in filtered" :key="t.id" style="border-bottom:1px solid #f2f2f2; vertical-align:top;">
          <td style="padding:10px; font-weight:700;">#{{ t.id }}</td>
          <td style="padding:10px;">{{ t.telegram_id }}</td>
          <td style="padding:10px;">{{ t.request_type }}</td>
          <td style="padding:10px; white-space:pre-wrap;">{{ t.description }}</td>
          <td style="padding:10px;">
            <select :value="t.status" @change="(e)=>updateStatus(t.id, e.target.value)" style="padding:8px; border:1px solid #ddd; border-radius:10px;">
              <option>Pending</option>
              <option>Done</option>
              <option>Rejected</option>
            </select>
          </td>
          <td style="padding:10px;">
            <div v-if="t.tg_file_id">
              <a :href="`/api/telegram-image?file_id=${encodeURIComponent(t.tg_file_id)}`" target="_blank">باز کردن عکس</a>
              <div style="margin-top:8px;">
                <img :src="`/api/telegram-image?file_id=${encodeURIComponent(t.tg_file_id)}`" style="max-width:160px; border-radius:10px; border:1px solid #eee;" />
              </div>
            </div>
            <span v-else style="opacity:.6;">—</span>
          </td>
        </tr>
      </tbody>
    </table>

    <p v-if="!loading && filtered.length===0" style="opacity:.7;">چیزی پیدا نشد.</p>
  </div>
</template>
