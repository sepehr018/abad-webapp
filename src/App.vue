<script setup>
import { onMounted, ref } from "vue";

const tgReady = ref(false);
const userText = ref("نامشخص");

onMounted(() => {
  const tg = window.Telegram?.WebApp;
  if (!tg) return;

  tg.ready();
  tg.expand();

  const user = tg.initDataUnsafe?.user;
  if (user) {
    userText.value = user.username ? `@${user.username}` : (user.first_name || "User");
  }
  tgReady.value = true;
});

function submitForm(e) {
  e.preventDefault();
  alert("فعلاً فقط UI هست ✅ مرحله بعد به بک‌اند وصل می‌کنیم");
}
</script>

<template>
  <div style="font-family: sans-serif; padding: 16px; max-width: 600px; margin: 0 auto;">
    <h2>📩 Abad WebApp</h2>

    <div v-if="!tgReady" style="padding: 12px; border: 1px solid #ddd; border-radius: 12px;">
      <p>این صفحه الان داخل مرورگر معمولی باز شده.</p>
      <p style="opacity: 0.7;">
        برای تست واقعی باید از داخل تلگرام به عنوان WebApp بازش کنیم.
      </p>
    </div>

    <div v-else style="padding: 12px; border: 1px solid #ddd; border-radius: 12px;">
      <p><b>✅ داخل تلگرام اجرا شد</b></p>
      <p>کاربر: <b>{{ userText }}</b></p>
    </div>

    <hr style="margin: 16px 0;" />

    <h3>فرم ثبت درخواست (MVP)</h3>

    <form @submit="submitForm" style="display: grid; gap: 10px;">
      <label>
        نوع درخواست
        <select style="width: 100%; padding: 10px; border-radius: 10px; border: 1px solid #ddd;">
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
          rows="4"
          placeholder="متن خطا / توضیح مشکل"
          style="width: 100%; padding: 10px; border-radius: 10px; border: 1px solid #ddd;"
        ></textarea>
      </label>

      <label>
        آپلود فایل/اسکرین‌شات
        <input type="file" style="width: 100%;" />
      </label>

      <button
        type="submit"
        style="padding: 12px; border-radius: 12px; border: none; cursor: pointer; font-weight: 700;"
      >
        ثبت درخواست
      </button>
    </form>
  </div>
</template>
