<script setup>
import { ref, onMounted } from "vue";

// Mock APIs – replace with real API calls
import { getItems, deleteItem } from "@/api/item";
import { getCategories, deleteCategory } from "@/api/category";
import { getConstants, updateConstant } from "@/api/constants";

const items = ref([]);
const categories = ref([]);
const constants = ref({
  facebook_url: "",
  instagram_url: "",
  whatsapp_url: "",
  merrycream_first_flavor: "",
  merrycream_second_flavor: "",
});

const showItemDialog = ref(false);
const showCategoryDialog = ref(false);
const editingItem = ref(null);
const editingCategory = ref(null);

onMounted(async () => {
  const { data: itemsData } = await getItems();
  items.value = itemsData;

  const { data: categoriesData } = await getCategories();
  categories.value = categoriesData;

  const { data: constantsData } = await getConstants();
  constants.value = constantsData;
});

// Handlers
const editItem = (item) => {
  editingItem.value = { ...item };
  showItemDialog.value = true;
};

const removeItem = async (id) => {
  await deleteItem(id);
  items.value = items.value.filter((i) => i.id !== id);
};

const editCategory = (category) => {
  editingCategory.value = { ...category };
  showCategoryDialog.value = true;
};

const removeCategory = async (id) => {
  await deleteCategory(id);
  categories.value = categories.value.filter((c) => c.id !== id);
};

const saveConstant = async (key, value) => {
  constants.value[key] = value;
  await updateConstant(key, value);
};
</script>

<template>
  <div class="p-6 space-y-10">
    <!-- Items Section -->
    <section>
      <h2 class="text-2xl font-bold mb-4">Items</h2>
      <DataTable :value="items" tableStyle="min-width: 50rem">
        <Column field="id" header="ID" />
        <Column field="name" header="Name" />
        <Column field="price" header="Price" />
        <Column header="Actions">
          <template #body="slotProps">
            <div class="flex gap-2">
              <Button
                icon="pi pi-pencil"
                severity="warning"
                rounded
                @click="editItem(slotProps.data)"
              />
              <Button
                icon="pi pi-trash"
                severity="danger"
                rounded
                @click="removeItem(slotProps.data.id)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </section>

    <!-- Categories Section -->
    <section>
      <h2 class="text-2xl font-bold mb-4">Categories</h2>
      <DataTable :value="categories" tableStyle="min-width: 40rem">
        <Column field="id" header="ID" />
        <Column field="name" header="Name" />
        <Column header="Actions">
          <template #body="slotProps">
            <div class="flex gap-2">
              <Button
                icon="pi pi-pencil"
                severity="warning"
                rounded
                @click="editCategory(slotProps.data)"
              />
              <Button
                icon="pi pi-trash"
                severity="danger"
                rounded
                @click="removeCategory(slotProps.data.id)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </section>

    <!-- Constants Section -->
    <section>
      <h2 class="text-2xl font-bold mb-4">Constants</h2>
      <div class="grid grid-cols-2 gap-4">
        <div v-for="(value, key) in constants" :key="key" class="flex flex-col">
          <label class="font-semibold mb-1 capitalize">{{ key }}</label>
          <InputText
            v-model="constants[key]"
            @blur="saveConstant(key, constants[key])"
            placeholder="Enter value"
          />
        </div>
      </div>
    </section>
  </div>

  <!-- Item Dialog -->
  <Dialog v-model:visible="showItemDialog" header="Edit Item" modal>
    <div v-if="editingItem" class="flex flex-col gap-3">
      <InputText v-model="editingItem.name" placeholder="Item Name" />
      <InputText v-model="editingItem.price" placeholder="Item Price" />
      <Button label="Save" @click="showItemDialog = false" />
    </div>
  </Dialog>

  <!-- Category Dialog -->
  <Dialog v-model:visible="showCategoryDialog" header="Edit Category" modal>
    <div v-if="editingCategory" class="flex flex-col gap-3">
      <InputText v-model="editingCategory.name" placeholder="Category Name" />
      <Button label="Save" @click="showCategoryDialog = false" />
    </div>
  </Dialog>
</template>
