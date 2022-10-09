#include<bits/stdc++.h>
using namespace std;
/* functions below are used for debugging */
display(vector<set<int> > S, int cnt = 0x7fffffff){
	for(int i = 0; i < S.size() && i < cnt; i ++){
		for(set<int>::iterator ii = S[i].begin(); ii != S[i].end(); ii ++)
			cout << *ii << " ";
		cout << endl;
	}
}
display_s(set<int> s){
	for(set<int>::iterator ii = s.begin(); ii != s.end(); ii ++)
		cout << *ii << " ";
	cout << endl;
}
class Apriori{
private:
	vector<set<int> > transactions;
	int size;
	int items;
	double min_sup;
	bool ready;
	set<int> confirmed;
	static const bool debug_on = true;
	Apriori(){
		transactions.clear();
		min_sup = 0.0;
		items = 0;
		size = 0;
		ready = false;
		confirmed.clear();
	}
	/* check whether the Apriori executor is ready to work */
	void check_ready(){
		if(transactions.size() > 0 && min_sup > 0.0)
			ready = true;
	}
	/* debug info output lol */
	void debug(string msg){
		if(debug_on)
			cout << msg << endl;
	}
	/* find frequent set with length of 1 */
	vector<set<int> > find_frequent_1_itemsets(){
		vector<set<int> > L1;
		for(int item = 1; item <= items; item ++){
			int counter = 0;
			for(int i = 0; i < size; i ++)
				if(transactions[i].find(item) != transactions[i].end())
					counter ++;
			double sup = (double)counter / (double)size;
			set<int> l = set<int>{item};
			record(l);
			if(sup >= min_sup)
				L1.push_back(l);
		}
		return L1;
	}
	/* add the given set to the confirmed hash set */
	void record(set<int> s){
		int hashcode = hash(s);
		confirmed.insert(hashcode);
	}
	/* judge whether the set is confirmed as a frequent set */
	bool exist(set<int> s){
		return confirmed.find(hash(s)) != confirmed.end();
	}
	bool exist(int hashcode){
		return confirmed.find(hashcode) != confirmed.end();
	}
	/* calculate the hashcode of given element set */
	int hash(set<int> s){
		static const int mod = 1e9 + 7;
		/* to avoid hash collision, choosing a prime larger than items is better, but I'm lazy XD */
		static const int base = items + 1;
		long long hashcode = 0;
		for(set<int>::iterator ii = s.begin(); ii != s.end(); ii ++){
			hashcode = (hashcode * base + (*ii)) % mod;
		}
		return (int)hashcode;
	}
	/* candidate set prune */
	bool prune(set<int>& candidate, set<int>& l1, set<int>& l2){
		int len = candidate.size();
		int hash1 = hash(l1), hash2 = hash(l2);
		for(set<int>::iterator ii = candidate.begin(); ii != candidate.end(); ii ++){
			set<int> subset(candidate.begin(), candidate.end());
			subset.erase(*ii);
			int hashcode = hash(subset);
			if(hash1 == hashcode || hash2 == hashcode)
				continue;
			if(!exist(hashcode))
				return false;
		}
		return true;
	}
	/* generate candidate for the next length frequent set */
	set<int> apriori_gen(set<int>& l1, set<int>& l2){
		if(l1.size() != l2.size()){
			debug("Error: Apriori can not generate candidate from sets with different length!");
			return set<int>{};
		}
		int len = l1.size();
		int matched = 0;
		set<int>::iterator i1 = l1.begin(), i2 = l2.begin();
		for(; i1 != l1.end() && i2 != l2.end() && matched < len - 1; i1 ++, i2 ++){
			/* l1[0..len - 1] != l1[0..len - 1] */
			if(*i1 != *i2)
				return set<int>{};
			matched ++;
		}
		set<int> candidate(l1.begin(), i1);
		candidate.insert(*i1);
		candidate.insert(*i2);
		if(prune(candidate, l1, l2))
			return candidate;
		else
			return set<int>{};
	}
	/* get the support count of a given element set */
	int get_support(set<int>& s){
		int counter = 0;
		for(int i = 0; i < size; i ++){
			bool sup = true;
			for(set<int>::iterator ii = s.begin(); ii != s.end(); ii ++){
				if(transactions[i].find(*ii) == transactions[i].end()){
					sup = false;
					break;
				}
			}
			if(sup)
				counter ++;
		}
		return counter;
	}
public:
	/* builder for the algorithm executer */
	static Apriori builder(){
		return Apriori();
	}
	/* load dataset from given file */
	Apriori load(string filepath){
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
		check_ready();
		return *this;
	}
	/* set up minimum support value */
	Apriori support(double min_sup){
		this->min_sup = min_sup;
		check_ready();
		return *this;
	}
	/* execute Apriori alogorithm and return frequent set */
	vector<set<int> > solve(){
		check_ready();
		if(!this->ready){
			debug("Error: Apripri container is not fully prepared...");
			return {};
		}
		confirmed.clear();
		/* generate L1 */
		vector<set<int> > A = find_frequent_1_itemsets();
		vector<set<int> > L(A.begin(), A.end());
		vector<set<int> > C;
		int k = 2;
		while(L.size() > 0){
			C.clear();
			int cnt = L.size();
			/* generate L_{k + 1} candidate C_k */
			for(int i = 0; i < cnt - 1; i ++)
				for(int j = i + 1; j < cnt; j ++){
					set<int> candidate = apriori_gen(L[i], L[j]);
					if(candidate.size() != 0)
						C.push_back(candidate);
				}
			int c_size = C.size();
			/* no candidate, algorithm finished */
			if(c_size == 0)
				break;
			/* discard L_k*/
			L.clear();
			/* L_{k + 1} will be generated here */
			for(int i = 0; i < c_size; i ++){
				int sup_cnt = get_support(C[i]);
				double sup = (double)sup_cnt / (double)size;
				if(sup >= min_sup)
					L.push_back(C[i]);
			}
			confirmed.clear();
			for(int i = 0; i < L.size(); i ++)
				record(L[i]);
			/* append L_{k + 1} to ans */
			A.insert(A.end(), L.begin(), L.end());
			k ++;
			/* clear candidate set */
			C.clear();
		}
		return A;
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
	/* create Apriori instance */
	Apriori app = Apriori::builder().load("data.txt").support(0.2);
	/* let's go ! */
	display(app.solve());
}
