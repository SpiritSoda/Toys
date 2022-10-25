#include<iostream>
#include<ctime>
#include<fstream>
#include<sstream>
#include<iomanip>
#include<cstdlib>
#include<algorithm>
using namespace std;

void insert_sort(int* arr, int size){
	for(int* i = arr + 1; i < arr + size; i ++){
		int base = *i;
		int *j = i - 1;
		while(j >= arr && *j > base){
			if(*j <= base){
				*(j + 1) = base;
				break;
			}
			*(j + 1) = *(j);
			j --;
		}
		*(j + 1) = base;
	}
}
// vanilla quick sort
void toy_quicksort(int* arr, int size, int k = 1){
	// quit if child question's size is not bigger than k
	if(size <= k)
		return;
	int base = arr[size - 1];
	int slow = -1;
	for(int fast = 0; fast < size - 1; fast++){
		if(arr[fast] < base){
			slow += 1;
			int temp = arr[slow];
			arr[slow] = arr[fast];
			arr[fast] = temp;
		}
	}
	slow += 1;
	arr[size - 1] = arr[slow];
	arr[slow] = base;
	toy_quicksort(arr, slow, k);
	toy_quicksort(arr + slow + 1, size - slow - 1, k);
}
// choose the medium of (first, middle, last) as base
void toy_quicksort_optimized_base(int* arr, int size, int k = 1){
	// quit if child question's size is not bigger than k
	if(size <= k)
		return;
	// choose the medium of (first, middle, last) as base
	int base1 = arr[0], base2 = arr[size - 1], base3 = arr[size >> 1];
	int base_idx = base1 >= base2 && base2 >= base3 ? size - 1 : (base1 >= base3 && base3 >= base2 ? (size >> 1) : 0);
	
	int base = arr[base_idx];
	arr[base_idx] = arr[size - 1];
	int slow = -1;
	for(int fast = 0; fast < size - 1; fast++){
		if(arr[fast] < base){
			slow += 1;
			int temp = arr[slow];
			arr[slow] = arr[fast];
			arr[fast] = temp;
		}
	}
	slow += 1;
	arr[size - 1] = arr[slow];
	arr[slow] = base;
	toy_quicksort_optimized_base(arr, slow, k);
	toy_quicksort_optimized_base(arr + slow + 1, size - slow - 1, k);
}
// accumulate base value together
void toy_quicksort_optimized_base_and_accumulate(int* arr, int size, int k = 1){
	// quit if child question's size is not bigger than k
	if(size <= k)
		return;
	// choose the medium of (first, middle, last) as base
	int base1 = arr[0], base2 = arr[size - 1], base3 = arr[size >> 1];
	int base_idx = base1 >= base2 && base2 >= base3 ? size - 1 : (base1 >= base3 && base3 >= base2 ? (size >> 1) : 0);
	
	int base = arr[base_idx];
	arr[base_idx] = arr[size - 1];
	int slow = -1, high = size - 1;
	for(int fast = 0; fast < high; fast++){
		if(arr[fast] < base){
			slow += 1;
			int temp = arr[slow];
			arr[slow] = arr[fast];
			arr[fast] = temp;
		}
		// move the same value to the tail
		else if(arr[fast] == base){
			high --;
			int temp = arr[high];
			arr[high] = arr[fast];
			arr[fast] = temp;
			fast --;
		}
	}
	slow += 1;
	arr[size - 1] = arr[slow];
	arr[slow] = base;
	int r_low = slow;
	slow += 1;
	
	// accumulate the base value
	for(int i = high; i < size - 1; i ++, slow ++){
		arr[i] = arr[slow];
		arr[slow] = base;
	}
	toy_quicksort_optimized_base_and_accumulate(arr, r_low, k);
	toy_quicksort_optimized_base_and_accumulate(arr + slow, size - slow, k);
}
// use pointer to avoid address calaculation
void toy_quicksort_optimized_base_and_accumulate_and_pointer(int* arr, int size, int k = 1){
	// quit if child question's size is not bigger than k
	if(size <= k)
		return;
	// choose the medium of (first, middle, last) as base
	int base1 = arr[0], base2 = arr[size - 1], base3 = arr[size >> 1];
	int base_idx = base1 >= base2 && base2 >= base3 ? size - 1 : (base1 >= base3 && base3 >= base2 ? (size >> 1) : 0);
	
	int base = arr[base_idx];
	arr[base_idx] = arr[size - 1];
	int* slow = arr - 1, *high = arr + size - 1;
	for(int* fast = arr; fast < high; fast++){
		if(*fast < base){
			slow ++;
			int temp = *slow;
			*slow = *fast;
			*fast = temp;
		}
		// move the same value to the tail
		else if(*fast == base){
			high --;
			int temp = *high;
			*high = *fast;
			*fast = temp;
			fast --;
		}
	}
	slow += 1;
	arr[size - 1] = *slow;
	*slow = base;
	int r_low = slow - arr;
	slow += 1;
	
	// accumulate the base value
	for(int* i = high; i - arr < size - 1; i ++, slow ++){
		*i = *slow;
		*slow = base;
	}
	toy_quicksort_optimized_base_and_accumulate_and_pointer(arr, r_low, k);
	toy_quicksort_optimized_base_and_accumulate_and_pointer(slow, size - (slow - arr), k);
}
void toy_quicksort_combined_with_insert_sort(int* arr, int size, int k){
	toy_quicksort_optimized_base(arr, size, k);
	insert_sort(arr, size);
}
void toy_quicksort_combined_with_insert_sort_and_accumulate(int* arr, int size, int k){
	toy_quicksort_optimized_base_and_accumulate(arr, size, k);
	insert_sort(arr, size);
}
void toy_quicksort_combined_with_insert_sort_and_accumulate_and_pointer(int* arr, int size, int k){
	toy_quicksort_optimized_base_and_accumulate_and_pointer(arr, size, k);
	insert_sort(arr, size);
}
inline int less_than(const void* a, const void* b){
	return *(int*)a - *(int*)b;
}

clock_t total = 0;
int times = 200;
int arr[100005];
int* work;
int main(){
	ifstream fin("data.txt");
	int size;
	fin >> size;
	string line;
	getline(fin, line);
	getline(fin, line);
	stringstream ss(line);
	int num, i = 0;
	while(ss >> num){
		arr[i++] = num;
	}
		
	for(int i = 0; i < times; i ++){
		work = (int*)malloc(100005 * sizeof(arr[0]));
		memcpy(work, arr, sizeof(arr));
		clock_t start = clock();
	
//		toy_quicksort(work, size);
//		toy_quicksort_combined_with_insert_sort(work, size, 9);
//		toy_quicksort_combined_with_insert_sort_and_accumulate(work, size, 9);
		toy_quicksort_combined_with_insert_sort_and_accumulate_and_pointer(work, size, 9);
//		qsort(work, size, sizeof(work[0]), less_than);
//		sort(work, work + size);
	
		clock_t finish   = clock();
		
		total += finish - start;
		free(work);
	}
    double avg_duration = (double)total / (double)(CLOCKS_PER_SEC * times);
    cout << "Quick Sort Time Cost: " << setprecision(6) << avg_duration << "s ..." << endl;
	
	toy_quicksort_combined_with_insert_sort_and_accumulate_and_pointer(arr, size, 9);
	ofstream fout("sorted.txt");
	int pre = -1;
	for(int i = 0; i < size; i ++){
		if(arr[i] < pre)
			cout << endl << "error!" << endl;
		pre = arr[i]; 
		fout << arr[i] << " ";
	}
}
