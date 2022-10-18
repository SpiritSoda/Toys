#include<iostream>
#include<vector>
#include<map>
#include<set>
#include<sstream>
#include<fstream>
#include<algorithm>
using namespace std;

/* functions below are used for debugging */
void display_vs(vector<set<int> > S, int cnt = 0x7fffffff){
	for(int i = 0; i < S.size() && i < cnt; i ++){
		cout << "[";
		for(set<int>::iterator ii = S[i].begin(); ii != S[i].end(); ii ++)
			cout << (ii == S[i].begin() ? "" : ", ") << (*ii);// << (char)(*ii + 'A' - 1);
		cout << "], ";
	}
	cout << endl;
}
void display_m(map<int, int> s){
	cout << "[";
	for(map<int, int>::iterator ii = s.begin(); ii != s.end(); ii ++)
		cout << (*ii).first << ": " << (*ii).second << endl;
	cout << "]" << endl;
}
void display_v(vector<int> v){
	for(int i = 0; i < v.size(); i ++)
		cout << (char)(v[i] + 'A' - 1) << " ";
	cout << endl;
}

class SetSort{
public:
	bool operator()(set<int>& s1, set<int>& s2){
		if(s1.size() < s2.size())
			return true;
		else if(s1.size() > s2.size())
			return false;
		else
		return s1 <= s2;	
	}
};
class FPSorter{
private:
	map<int, int> frequent_item;
public:
	FPSorter(): frequent_item(map<int, int>()){}
	FPSorter(map<int, int> frequent_item): frequent_item(frequent_item){}
	bool operator()(const int& item1, const int& item2){
		return frequent_item[item1] > frequent_item[item2];
	}
	template<typename T>
	bool operator()(const pair<int, T>& item1, const pair<int, T>& item2){
		return frequent_item[item1.first] > frequent_item[item2.first];
	}
};

class FPPair{
public:
	int item;
	int sup;
	FPPair(): item(-1), sup(0){}
	FPPair(int item): item(item), sup(0){}
};


class FPNode{
private:
	map<int, FPNode*> childs;
	FPNode* parent;
	FPNode* child(int item){
		if(this->childs.find(item) == this->childs.end())
			this->childs[item] = new FPNode(item, this);
		return this->childs[item];
	}
public:
	FPPair pair;
	FPNode(int item, FPNode* parent){
		this->childs.clear();
		this->parent = parent;
		this->pair = FPPair(item);
	}
	FPNode(int item){
		this->childs.clear();
		this->parent = NULL;
		this->pair = FPPair(item);
	}
	int insert(const vector<int>& itemset, int idx, int sup = 1){
		this->pair.sup += sup;
		if(idx >= itemset.size())
			return this->childs.size();
		int v1 = this->child(itemset[idx])->insert(itemset, idx + 1, sup), v2 = (int)this->childs.size();
		return max(v1, v2);	
	}
	void cutoff(){
		for(map<int, FPNode*>::iterator ii = childs.begin(); ii != childs.end(); ii ++){
			(*ii).second->cutoff();
			free((*ii).second);
		}
	}
	vector<set<int> > construct_frequent_pattern(int min_sup_count){
		if(this->pair.sup < min_sup_count)
			return {};
		vector<set<int> > A = {}; 
		for(map<int, FPNode*>::iterator ii= childs.begin(); ii != childs.end(); ii ++){
			vector<set<int> > items = (*ii).second->construct_frequent_pattern(min_sup_count);
			A.insert(A.end(), items.begin(), items.end());
		}
		if(!this->parent)
			return A;
		else{
			vector<set<int> > B(A.begin(), A.end());
			for(int i = 0; i < A.size(); i ++)
				A[i].insert(this->pair.item);
			A.push_back({this->pair.item});	
			A.insert(A.end(), B.begin(), B.end());
			return A;
		}
	}
	/* backtrace to root */
	void backtrace(vector<int>& list) const{
		if(this->parent){
			list.push_back(this->pair.item);
			this->parent->backtrace(list);
		}
		else
			reverse(list.begin(), list.end());
	}
	const map<int, FPNode*>& get_childs(){
		return this->childs;
	}
	const FPNode* get_parent(){
		return this->parent;
	}
};

class FPList{
private:
	FPNode* node;
	FPList* next;
public:
	FPList(): node(NULL), next(NULL){}
	FPList(FPNode* node): node(node), next(NULL){}
	FPList* extend(FPNode* node){
		FPList* next = new FPList(node);
		this->next = next;
		return next;
	}
	int construct_pattern_base(vector<pair<vector<int>, int> >& pattern_bases){
		int sup = node->pair.sup;
		int tot_sup = sup;
		vector<int> list;
		const FPNode* scan = node->get_parent();
		scan->backtrace(list);
		pattern_bases.push_back(make_pair(list, sup));
		if(next)
			tot_sup += next->construct_pattern_base(pattern_bases);
		return tot_sup;
	}
	/* functions below are used for debugging */
	void display(){
		cout << "(" << node->pair.item << ", "<< node->pair.sup << ")";
		if(next){
			cout << " -> ";
			next->display();
		}
	}
	int count(){
		return node->pair.sup + (next ? next->count() : 0);
	}
};

class FPTree{
private:
	FPNode* root;
	map<int, pair<FPList*, int>> list;
	bool only_path;
	// scan the tree and build node list
	void build_list(FPNode* node, map<int, FPList*>& tail){
		for(const pair<int, FPNode*>& child: node->get_childs()){
			extend_list(child.first, child.second, tail);
			build_list(child.second, tail);
		}
	}
	// scan node list of given item
	void extend_list(int item, FPNode* node, map<int, FPList*>& tail){
		if(list.find(item) == list.end()){
			list[item] = make_pair(new FPList(node), 0);
			tail[item] = list[item].first;
		}
		else
			tail[item] = tail[item]->extend(node);
		list[item].second += node->pair.sup;
	}
	// build conditional tree
	FPTree* build_conditional_tree(const vector<pair<vector<int>, int> >& pattern_bases, int base, int min_sup_count){
		FPTree* root = new FPTree(base);
		int n = pattern_bases.size();
		for(int i = 0; i < n; i ++){
			root->insert(pattern_bases[i].first, pattern_bases[i].second);
		}
		root->build_list();
		return root;
	}
public:
	FPTree(){
		root = new FPNode(-1);
		list.clear();
		only_path = true;
	}
	FPTree(int base){
		root = new FPNode(base);
		list.clear();
		only_path = true;
	}
	/* insert an itemset to FP Tree */
	void insert(const vector<int>& itemset, int sup = 1){
		int v = root->insert(itemset, 0, sup);
		this->only_path = this->only_path && (v <= 1);
	}
	/* build node list from the FP Tree */
	void build_list(){
		map<int, FPList*> tail;
		build_list(root, tail);
	}
	/* construct FP Tree until single path */
	vector<set<int> > find_frequent_pattern(FPSorter& sorter, int min_sup_count){
		if(this->only_path){
			return this->root->construct_frequent_pattern(min_sup_count);
		}
		vector<pair<int, pair<FPList*,int>>> sorted = vector<pair<int, pair<FPList*,int>>>(list.begin(), list.end());
		sort(sorted.begin(), sorted.end(), sorter);
		int n = sorted.size();
		vector<set<int> > A;
		for(int i = n - 1; i >= 0; i --){
			int itembase = sorted[i].first;
			int sup_count = sorted[i].second.second;
			// if current base is not well supported, discard it
			if(sup_count < min_sup_count)
				continue;
				
			FPList* fplist = sorted[i].second.first;
			vector<pair<vector<int>, int> >pattern_bases;
			fplist->construct_pattern_base(pattern_bases);
			
			// build new conditional FP tree;
			FPTree* conditional_tree = build_conditional_tree(pattern_bases, itembase, min_sup_count);
			vector<set<int> > patterns = conditional_tree->find_frequent_pattern(sorter, min_sup_count);
			
			for(int i = 0; i < patterns.size(); i ++){
				patterns[i].insert(itembase);
			}
			patterns.push_back({itembase});
			A.insert(A.end(), patterns.begin(), patterns.end());
		}
		sort(A.begin(), A.end(), SetSort());
		return A;
	}
	/* functions below are used for debugging */
	int count(){
		return root->pair.sup;
	}
	void display_list(){
		for(map<int, pair<FPList*, int>>::iterator ii = list.begin(); ii != list.end(); ii ++){
			cout << (*ii).first << "(" << (*ii).second.second <<  "): ";
			(*ii).second.first->display();
			cout << endl;	
		}
	}
	void display_list_count(){
		for(map<int, pair<FPList*, int> >::iterator ii = list.begin(); ii != list.end(); ii ++){
			cout << (*ii).first << ": " << (*ii).second.second << endl;
		}
	}
};

class FPGrowth{
private:
	FPTree* fptree;
	vector<set<int> > transactions;
	map<int, int> frequent_item;
	int size;
	int items;
	double min_sup;
	int min_sup_count;
	bool ready;
	static const bool debug_on = true;
	FPGrowth(){
		fptree = new FPTree();
		transactions.clear();
		min_sup = 0.0;
		items = 0;
		size = 0;
		ready = false;
	}
	/* find frequent set with length of 1 */
	void find_frequent_1_itemsets(){
		vector<set<int> > L1;
		for(int item = 1; item <= items; item ++){
			int counter = 0;
			for(int i = 0; i < size; i ++)
				if(transactions[i].find(item) != transactions[i].end())
					counter ++;
			double sup = (double)counter / (double)size;
			if(sup >= min_sup)
				frequent_item[item] = counter;
		}
	}
	/* check whether the FPGrowth executor is ready to work */
	void check_ready(){
		if(transactions.size() > 0 && min_sup > 0.0){
			min_sup_count = min_sup * transactions.size();
			ready = true;
		}
	}
	/* debug info output lol */
	void debug(string msg){
		if(debug_on)
			cout << msg << endl;
	}
	/* project transactions to frequent item dimension */
	void project(){
		vector<set<int> > new_transactions;
		for(int i = 0; i < size; i ++){
			set<int> projected;
			for(set<int>::iterator ii = transactions[i].begin(); ii != transactions[i].end(); ii ++){
				if(frequent_item.find(*ii) != frequent_item.end())
					projected.insert(*ii);
			}
			if(projected.size() > 0)
				new_transactions.push_back(projected);
		}
		this->transactions = new_transactions;
		this->size = new_transactions.size();
	}
public:
	static FPGrowth builder(){
		return FPGrowth();
	}
	/* load dataset from given file */
	FPGrowth load(string filepath){
		transactions.clear();
		size = 0;
		ifstream fin(filepath);
		string line;
		while(getline(fin, line)){
			/* use stringstream to load 1 element each time */
			stringstream ss(line);
			set<int> trans;
			int el;
			while(ss >> el){
				items = max(items, el);
				trans.insert(el);
			}
			transactions.push_back(trans);
		}
		size = transactions.size();
		this->check_ready();
		return *this;
	}
	/* set up minimum support value */
	FPGrowth support(double min_sup){
		this->min_sup = min_sup;
		check_ready();
		return *this;
	}
	/* execute FPGrowth alogorithm and return frequent set */
	vector<set<int> > solve(){
		check_ready();
		if(!this->ready){
			debug("Error: FPGrowth executor is not fully prepared...");
			return {};
		}
		find_frequent_1_itemsets();
		project();
		
		// sort the transactions set based on item frequency
		FPSorter sorter = FPSorter(this->frequent_item);
		for(int i = 0; i < size; i ++){
			vector<int> sorted = vector<int>(transactions[i].begin(), transactions[i].end());
			sort(sorted.begin(), sorted.end(), sorter);
			fptree->insert(sorted);
		}
		fptree->build_list();
		return fptree->find_frequent_pattern(sorter, min_sup_count);
	}
	/* functions below are used for debugging */
	void display(int cnt = 0x7fffffff){
		for(int i = 0; i < size && i < cnt; i ++){
			for(set<int>::iterator ii = transactions[i].begin(); ii != transactions[i].end(); ii ++)
				cout << *ii << " ";
			cout << endl;
		}
	}
};
int main(){
	/* create FPGrowth instance */
	FPGrowth app = FPGrowth::builder().load("data.txt").support(0.268);
	/* let's go ! */
	display_vs(app.solve());
}
