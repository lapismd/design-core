/** Official BearToCode/mismerge demo `placeholder/*-quicksort.c` texts. */
export const mismergeQuicksortFixture = {
  path: "quicksort.c",
  language: "c",
  leftLabel: "Left",
  baseLabel: "Resolved",
  rightLabel: "Right",
  left: "void swap(int *a, int *b) {\n  int t = *a;\n  *a = *b;\n  *b = t;\n}\n\nint partition(int array[], int low, int high) {\n  int pivot = array[high];\n  int i = low - 1;\n\n  for (int j = low; j < high; j++) {\n    if (array[j] <= pivot) {\n      i++;\n      swap(&array[i], &array[j]);\n    }\n  }\n  swap(&array[high], &array[i + 1]);\n  \n  return i + 1;\n}\n\n/**\n * Simple implementation of the Quick Sort algorithm.\n */\nvoid quick_sort(int array[], int low, int high) {\n  if (low < high) {\n    int pi = partition(array, low, high);\n   \n    quick_sort(array, low, pi - 1);\n    quick_sort(array, pi + 1, high);\n  }\n}",
  base: "void swap(int *a, int *b) {\n  int t = *a;\n  *a = *b;\n  *b = t;\n}\n\nint partition(int array[], int low, int high) {\n  int pivot = array[high];\n  int i = low - 1;\n\n\t// Move all the elements higher than the pivot\n\t// to the left side of the partition\n  for (int j = low; j < high; j++) {\n    if (array[j] <= pivot) {\n      i++;\n      swap(&array[i], &array[j]);\n    }\n  }\n  swap(&array[i + 1], &array[high]);\n  \n  return i + 1;\n}\n\nvoid quick_sort(int array[], int low, int high) {\n  if (low < high) {\n    int pi = partition(array, low, high);\n   \n    quick_sort(array, low, pi - 1);\n    quick_sort(array, pi + 1, high);\n  }\n}",
  right:
    "void swap(int *a, int *b) {\n  int t = *a;\n  *a = *b;\n  *b = t;\n}\n\nint partition(int *array, int low, int high) {\n  int pivot = array[high];\n  int i = low - 1;\n\n  for (int j = low; j < high; j++) {\n    if (array[j] <= pivot) {\n      i++;\n      swap(&array[i], &array[j]);\n    }\n  }\n  swap(\n\t\t&array[i + 1], \n\t\t&array[high]\n\t);\n  \n  return i + 1;\n}\n\nvoid quick_sort(int array[], int low, int high) {\n  if (low < high) {\n    int pi = partition(array, low, high);\n   \n    quick_sort(array, low, pi - 1);\n    quick_sort(array, pi + 1, high);\n  }\n}",
} as const;
