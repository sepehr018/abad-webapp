<script setup>
import { onMounted, ref } from "vue";
import { supabase } from "./supabase.js";

const hasInitData = ref("no");
const platformText = ref("unknown");
const tgReady = ref(false);

const userText = ref("نامشخص");
const telegramIdText = ref("unknown");

const requestType = ref("Apple ID");
const description = ref("");

const isSubmitting = ref(false);
const resultText = ref("");

onMounted(() => {
  const tg = window.Telegram?.WebApp;
  if (!tg) return;

  tg.ready();
  tg.expand();

  hasInitData.value = tg.initData && tg.initData.length > 0 ? "yes" : "no";
  platformText.value = tg.platform || "unknown";

  const user = tg.initDataUnsafe?.user;
  telegramIdText.value = user?.id ? String(user.id) : "unknown";

  if (user) {
    userText.value = user.username ? `@${user.username}` : (user.first_name || "User");
  }

  tgReady.value = true;
});

async function submitForm(e) {
  e.preventDefault();
  resultText.value = "";

  const tg = window.Telegram?.WebApp;
  const user = tg?.initDataUnsafe?.user;
  const telegramId = user?.id ? String(user.id) : "unknown";

  if (!description.value.trim()) {
    resultText.value = "❌ لطفاً توضیحات/متن خطا را وارد کنید.";
    return;
  }

  isSubmitting.value = true;

  try {
    const { data, error } = await supabase
      .from("tickets")
      .insert([
        {
          telegram_id: telegramId,
          request_type: requestType.value,
          description: description.value,
          status: "Pending",
        },
      ])
      .select("id")
      .single();

    if (error) throw error;

    resultText.value =
      `✅ تیکت ثبت شد. شماره تیکت: #${data.id}\n` +
      `📸 حالا اسکرین‌شات/عکس رو داخل چت ربات بفرست و روی عکس بنویس: #${data.id}`;

    description.value = "";

    tg?.showPopup?.({
      title: "مرحله بعد ✅",
      message: `تیکت #${data.id} ثبت شد.\nحالا عکس رو تو چت ربات بفرست و بنویس: #${data.id}`,
      buttons: [{ type: "ok" }],
    });
  } catch (err) {
    resultText.value = `❌ خطا: ${err?.message || String(err)}`;
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div style="font-family: sans-serif; padding: 16px; max-width: 640px; margin: 0 auto;">
    <h2>📩 Abad WebApp</h2>

    <div v-if="!tgReady" style="padding: 12px; border: 1px solid #ddd; border-radius: 12px;">
      <p>این صفحه الان داخل مرورگر معمولی باز شده.</p>
      <p style="opacity: 0.7;">برای تست واقعی باید از داخل تلگرام به عنوان WebApp بازش کنیم.</p>
    </div>

    <div v-else style="padding: 12px; border: 1px solid #ddd; border-radius: 12px;">
      <p><b>✅ داخل تلگرام اجرا شد</b></p>
      <p>کاربر: <b>{{ userText }}</b></p>
      <p>Telegram ID: <b>{{ telegramIdText }}</b></p>
      <p>Has initData: <b>{{ hasInitData }}</b></p>
      <p>Platform: <b>{{ platformText }}</b></p>
    </div>

    <hr style="margin: 16px 0;" />

    <h3>فرم ثبت درخواست (MVP)</h3>

    <form @submit="submitForm" style="display: grid; gap: 10px;">
      <label>
        نوع درخواست
        <select
          v-model="requestType"
          style="width: 100%; padding: 10px; border-radius: 10px; border: 1px solid #ddd;"
        >
          <option>Apple ID</option>
          <option>License/Credit</option>
          <option>Registration</option>
          <option>Telegram Premium</option>
          <option>VPS</option>
          <option>Subscription</option>
          <option>Other</option>
        </select>
      </label>

      <label>
        توضیحات
        <textarea
          v-model="description"
          rows="4"
          placeholder="متن خطا / توضیح مشکل"
          style="width: 100%; padding: 10px; border-radius: 10px; border: 1px solid #ddd;"
        ></textarea>
      </label>

      <button
        type="submit"
        :disabled="isSubmitting"
        style="padding: 12px; border-radius: 12px; border: none; cursor: pointer; font-weight: 700;"
      >
        {{ isSubmitting ? "در حال ثبت..." : "ثبت درخواست" }}
      </button>

      <pre v-if="resultText" style="margin-top: 12px; font-weight: 700; white-space: pre-wrap;">
{{ resultText }}
      </pre>
    </form>
  </div>
</template>
