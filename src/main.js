import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { createPinia } from "pinia";
import "./style.css";

// PrimeVue core
import PrimeVue from "primevue/config";
import ToastService from "primevue/toastservice";

// PrimeVue theme & icons
import "@primevue/themes/lara";
import "primeicons/primeicons.css";

// PrimeVue components
import Carousel from "primevue/carousel";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Password from "primevue/password";
import Button from "primevue/button";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Row from "primevue/row";
import Card from "primevue/card";
import ProgressSpinner from "primevue/progressspinner";
import Select from "primevue/select";
import InputNumber from "primevue/inputnumber";
import Textarea from "primevue/textarea";
import Checkbox from "primevue/checkbox";

const app = createApp(App);

// Register components globally
app.component("Carousel", Carousel);
app.component("Dialog", Dialog);
app.component("InputText", InputText);
app.component("Password", Password);
app.component("Button", Button);
app.component("DataTable", DataTable);
app.component("Column", Column);
app.component("Row", Row);
app.component("Card", Card);
app.component("ProgressSpinner", ProgressSpinner);
app.component("Select", Select);
app.component("InputNumber", InputNumber);
app.component("Textarea", Textarea);
app.component("Checkbox", Checkbox);

// Use plugins
app.use(router);
app.use(createPinia());
app.use(PrimeVue);
app.use(ToastService);

app.mount("#app");
