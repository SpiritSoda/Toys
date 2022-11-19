#include<iostream>
#include<fstream>
#include<sstream>
#include<string>
#include<queue>
#include<algorithm>
#include<random>
#include<chrono>
using namespace std;

bool run_delete = true;
bool show_op_case = false;
bool show_op_info = false;
bool verify = true;
class Interval{
public:
	int l;
	int r;
	Interval(): l(-1), r(-1){}
	Interval(int l, int r): l(l), r(r){}
	bool operator < (const Interval& i) const {
		return this->l < i.l;
	}
	bool operator > (const Interval& i) const {
		return this->l > i.l;
	}
	bool operator == (const Interval& i) const {
		return this->l == i.l && this->r == i.r;
	}
	static bool overlap(const Interval& i1, const Interval& i2){
		return i1.r >= i2.l && i1.l <= i2.r;
	}
	friend ostream& operator << (ostream&, Interval&);
};
ostream& operator << (ostream& os, Interval& i){
	return os << "[" << i.l << ", " << i.r << "]";
}
enum RBColor{
	RED = 0,
	BLACK = 1
};
// RB tree node
class IntervalNode{
protected:
	RBColor color;
	Interval key;
	int max;
	IntervalNode* left;
	IntervalNode* right;
	IntervalNode* parent;
	
	friend class IntervalTree;
	friend void reset_null();
public:
	// null node
	static IntervalNode* null;
	IntervalNode(Interval value): color(RED), key(value), max(value.r), left(null), right(null), parent(null){}
	IntervalNode(){
		key = Interval(-1, -1);
		max = -1;
		color = BLACK;
		left = this;
		right = this;
		parent = this;
	}
	string get_color(){
		if(color == RED)
			return "red";
		else if(color == BLACK)
			return "black";
		return "unknown";
	}
	Interval& get_key(){
		return key;
	} 
};
IntervalNode* IntervalNode::null = new IntervalNode();
IntervalNode* null = IntervalNode::null;

void reset_null(){
	null->max = -1;
	null->key.l = -1;
	null->key.r = -1;
}
class IntervalTree{
private:
    // root pointer
	IntervalNode* root; 	
	
    // some private operations like rotation and attribute fixer
	// output function
	void preorder(IntervalNode* node, ofstream& fout){
		if(node == null)
			return;
		fout << node->key << ",\t" << node->get_color() << endl;
		preorder(node->left, fout);
		preorder(node->right, fout);
	}
	void inorder(IntervalNode* node, ofstream& fout){
		if(node == null)
			return;
		inorder(node->left, fout);
		fout << node->key << ",\t" << node->get_color() << endl;
		inorder(node->right, fout);
	}
	void postorder(IntervalNode* node, ofstream& fout){
		if(node == null)
			return;
		postorder(node->left, fout);
		postorder(node->right, fout);
		fout << node->key << ",\t" << node->get_color() << endl;
	}
	// get minimum value in a subtree
	IntervalNode* tree_minimum(IntervalNode* node){
		IntervalNode* scan = node;
		while(scan->left != null)
			scan = scan->left;
		return scan;
	}
	// rotate
	void rotate_left(IntervalNode* x){
		IntervalNode* y = x->right;
		x->right = y->left;
		if(y->left != null)
			y->left->parent = x;
		y->parent = x->parent;
		if(x->parent == null)
			root = y;
		else if(x == x->parent->left)
			x->parent->left = y;
		else
			x->parent->right = y;
		y->left = x;
		x->parent = y;
		
		update_max(x);
		update_max(y);
	}
	void rotate_right(IntervalNode* x){
		IntervalNode* y = x->left;
		x->left = y->right;
		if(y->right != null)
			y->right->parent = x;
		y->parent = x->parent;
		if(x->parent == null)
			root = y;
		else if(x == x->parent->left)
			x->parent->left = y;
		else
			x->parent->right = y;
		y->right = x;
		x->parent = y;
		
		update_max(x);
		update_max(y);
	}
	// tree node transplant, will be used in interval_delete
	void interval_transplant(IntervalNode* u, IntervalNode* v){
		if(u->parent == null)
			root = v;
		else if(u == u->parent->left)
			u->parent->left = v;
		else
			u->parent->right= v;
		v->parent = u->parent;
	}
	// insert fixup
	void interval_insert_fixup(IntervalNode* z){
		while(z->parent->color == RED){
			if(z->parent == z->parent->parent->left){
				IntervalNode* y = z->parent->parent->right;
				if(y->color == RED){
					// case 1
					// transfer to case 2
					if(show_op_case)
						cout << "insert case 1" << endl;
					z->parent->color = BLACK;
					y->color = BLACK;
					z->parent->parent->color = RED;
					z = z->parent->parent;
				}
				else{
					if(z == z->parent->right){
						// case 2
						// transfer to case 3
						if(show_op_case)
							cout << "insert case 2" << endl;
						z = z->parent;
						rotate_left(z);
					}
					// case 3
					if(show_op_case)
						cout << "insert case 3" << endl;
					z->parent->color = BLACK;
					z->parent->parent->color = RED;
					rotate_right(z->parent->parent);
				}
			}
			else{
				IntervalNode* y = z->parent->parent->left;
				if(y->color == RED){
					// case 4
					// transfer to case 5
					if(show_op_case)
						cout << "insert case 4" << endl;
					z->parent->color = BLACK;
					y->color = BLACK;
					z->parent->parent->color = RED;
					z = z->parent->parent;
				}
				else{
					if(z == z->parent->left){
						// case 5
						// transfer to case 6
						if(show_op_case)
							cout << "insert case 5" << endl;
						z = z->parent;
						rotate_right(z);
					}
					// case 6
					if(show_op_case)
						cout << "insert case 6" << endl;
					z->parent->color = BLACK;
					z->parent->parent->color = RED;
					rotate_left(z->parent->parent);
				}
				
			}
		}
		root->color = BLACK;
	}
	// delete fixup
	void interval_delete_fixup(IntervalNode* x){
		while(x != root && x->color == BLACK){
			if(x == x->parent->left){
				IntervalNode* w = x->parent->right;
				if(w->color == RED){
					// case 1
					if(show_op_case)
						cout << "delete case 1" << endl;
					w->color = BLACK;
					x->parent->color = RED;
					rotate_left(x->parent);
					w = x->parent->right;
				}
				if(w->left->color == BLACK && w->right->color == BLACK){
					// case 2
					if(show_op_case)
						cout << "delete case 2" << endl;
					w->color = RED;
					x = x->parent;
				}
				else{	
					if(w->right->color == BLACK){
						// case 3
						// transfer to case 4
						if(show_op_case)
							cout << "delete case 3" << endl;
						w->left->color = BLACK;
						w->color = RED;
						rotate_right(w);
						w = x->parent->right;
					}
					// case 4
					if(show_op_case)
						cout << "delete case 4" << endl;
					w->color = x->parent->color;
					x->parent->color = BLACK;
					w->right->color = BLACK;
					rotate_left(x->parent);
					x = root;
				} 
			}
			else{
				IntervalNode* w = x->parent->left;
				if(w->color == RED){
					// case 5
					if(show_op_case)
						cout << "delete case 5" << endl;
					w->color = BLACK;
					x->parent->color = RED;
					rotate_right(x->parent);
					w = x->parent->left;
				}
				if(w->left->color == BLACK && w->right->color == BLACK){
					// case 6
					if(show_op_case)
						cout << "delete case 6" << endl;
					w->color = RED;
					x = x->parent;
				}
				else{	
					if(w->left->color == BLACK){
						// case 7
						// transfer to case 8
						if(show_op_case)
							cout << "delete case 7" << endl;
						w->right->color = BLACK;
						w->color = RED;
						rotate_left(w);
						w = x->parent->left;
					}
					// case 8
					if(show_op_case)
						cout << "delete case 8" << endl;
					w->color = x->parent->color;
					x->parent->color = BLACK;
					w->left->color = BLACK;
					rotate_right(x->parent);
					x = root;
				} 
			}
		}
		x->color = BLACK;
	}
	// check subtree's RB attributes, returns validation and black height
	pair<bool, int> rb_check(IntervalNode* node){
    	// reach leaf node, return valid tree with black height 0
		if(node == null){
			return make_pair(true, 0);
		}
    	// check if child's subtree is valid and get their black height 
		pair<bool, int> res1 = rb_check(node->left), res2 = rb_check(node->right);
		// if one of the subtrees is invalid, return invalid
		if(!res1.first || !res2.first)
			return make_pair(false, -1);
		// attribute 5: if subtrees' black height is not equal, return invalid
		if(res1.second != res2.second){
			cout << "RB Error::subtree's black height not equal on: " << node->key << endl;
			return make_pair(false, -1);
		}
    	// attribute 4: if current node is red, its child nodes must be black
		if(node->color == RED && (node->left->color != BLACK || node->right->color != BLACK)){
			cout << "RB Error::red node's child is not black on: " << node->key << endl;
			return make_pair(false, -1);
		}
    	// BST attribute verification
		if(!((node->left == null || node->key > node->left->key) && (node->right == null || node->key < node->right->key))){
			cout << "RB Error::invalid BST on: " << node->key << endl;
			return make_pair(false, -1);
		}
    	// all verification passed, return valid and update black height
		return make_pair(true, res1.second + (node->color == BLACK ? 1 : 0));
	}
	// update max value from a node to the root
	void update_max_to_root(IntervalNode* node){
		IntervalNode* scan = node;
		while(scan != null){
			int max_of_child = max(scan->left->max, scan->right->max);
			scan->max = max(scan->key.r, max_of_child);
			scan = scan->parent;
		}
	}
	// update max value of a single node
	void update_max(IntervalNode* node){
		int max_of_child = max(node->left->max, node->right->max);
		node->max = max(node->key.r, max_of_child);
	}
	int interval_check(IntervalNode* node){
		if(node == null)
			return -1;
		int max_of_child = max(interval_check(node->left), interval_check(node->right));
		int max_should_be = max(max_of_child, node->key.r);
		if(max_should_be != node->max)
			cout << "Interval Error::interval tree max value error on " << node->key << endl;
		return node->max;
	}
	
public:
	IntervalTree(){
		root = null;
		root->parent = null;
	}
	// insert a key into rb tree
	void interval_insert(Interval value){
		IntervalNode* node = new IntervalNode(value);
		if(root == null)
			root = node;
		else{
			IntervalNode* scan = root;
			while(1){
				if(value > scan->key){
					if(scan->right == null){
						scan->right = node;
						node->parent = scan;
						break;
					}
					else
						scan = scan->right;
				}
				else{
					if(scan->left == null){
						scan->left = node;
						node->parent = scan;
						break;
					}
					else
						scan = scan->left;
				}
			}
		}
		null->max = -1;
		// update max
		update_max_to_root(node);
		interval_insert_fixup(node);
		null->max = -1;
	}
	// search overlap interval in rb tree
	IntervalNode* interval_overlap(Interval i){
		IntervalNode* x = root;
		while(x != null && !Interval::overlap(x->key, i)){
//			cout << x->key << " " << x->max << endl;
			if(x->left != null && x->left->max >= i.l)
				x = x->left;
			else
				x = x->right;
		}
		return x;
	}
	// search given key in rb tree
	IntervalNode* interval_search(Interval key){
		IntervalNode* scan = root;
		while(scan != null){
			if(scan->key == key)
				return scan;
			else{
				if(key < scan->key)
					scan = scan->left;
				else
					scan = scan->right;
			}
		}
		return null;
	}
	// delete a node with given key in rb tree
	void interval_delete(Interval key){
		IntervalNode* z = interval_search(key);
		if(z == null)
			return;
		IntervalNode* y = z;
		IntervalNode* x = null;
		RBColor y_origin_color = y->color;
		if(z->left == null){
			x = z->right;
			interval_transplant(z, z->right);
		}
		else if(z->right == null){
			x = z->left;
			interval_transplant(z, z->left);
		}
		else{
			y = tree_minimum(z->right);
			y_origin_color = y->color;
			x = y->right;
			
			if(y->parent == z)
				x->parent = y;
			else{
				interval_transplant(y, y->right);
				y->right = z->right;
				y->right->parent = y;
			}
			interval_transplant(z, y);
			y->left = z->left;
			y->left->parent = y;
			y->color = z->color;
		}
		reset_null();
		// update max
		update_max_to_root(x->parent);
		if(y_origin_color == BLACK)
			interval_delete_fixup(x);
		reset_null();
	}
	// output
	void preorder(string out){
		ofstream fout(out);
		preorder(root, fout);
	}
	void inorder(string out){
		ofstream fout(out);
		inorder(root, fout);
	}
	void postorder(string out){
		ofstream fout(out);
		postorder(root, fout);
	}
	void levelorder(string out){
		ofstream fout(out);
		queue<IntervalNode*> q;
		q.push(root);
		while(!q.empty()){
			IntervalNode* node = q.front();
			q.pop();
			
			int layer = 1;
			IntervalNode* scan = node->parent;
			while(scan != null){
				scan = scan->parent;
				layer ++;
			}
			fout << node->key << ",\t" << node->max << ",\t" << node->get_color() << ",\t\t" << layer << endl;
			if(node->left != null)
				q.push(node->left);
			if(node->right != null)
				q.push(node->right);
		}
	}
	// verify rb tree validation
	bool rb_verify(){
    	// atrribute 1: limited by the enum type RBColor, must be satisfied
    	// attribute 3: leaf node is 'null', which is black, satisfied
    	// attribute 2: if root node is not black return invalid
		if(root->color != BLACK){
			cout << "RB Error::root is not black ..." << endl;
			return false;
		}
		return rb_check(root).first;
	}
	bool interval_verify(){
		reset_null();
		return interval_check(root) == root->max;
	}
};

int main(){
	IntervalTree itree;
	ifstream fin("insert.txt");
	int n;
	fin >> n;
	string line;
	getline(fin, line);
	int l, r;
	vector<Interval> intervals;
	while(getline(fin, line)){
		stringstream ss(line);
		ss >> l >> r;
		Interval interval = Interval(l, r);
		intervals.push_back(interval);
		if(show_op_info)
			cout << "Inserting Interval" << interval << endl;
		itree.interval_insert(interval);
	}
	if(show_op_info || show_op_case){
		cout << "Insert finished ..." << endl;
		cout << endl;
	}
	int inserted = intervals.size();
	int deleted = 0;
	if(run_delete){
		auto rng = std::default_random_engine(chrono::steady_clock::now().time_since_epoch().count());
		std::shuffle(intervals.begin(), intervals.end(), rng);
		uniform_int_distribution<> uid(1, intervals.size());
		deleted = uid(rng);
		for(int i = 0; i < deleted; i ++){
			if(show_op_info)
				cout << "Deleting Interval" << intervals[i] << endl;
			itree.interval_delete(intervals[i]);
			intervals[i] = Interval();
		}
		if(show_op_info || show_op_case){
			cout << "Delete finished ..." << endl;
			cout << endl;
		}
	}
	// log the total insert count and delete count
	cout << "Inserted " << inserted << " intervals and deleted " << deleted << " intervals ..." << endl;
	// verify rb attribute and interval attribute
	if(verify){
		cout << (itree.rb_verify() ? "valid RB tree" : "invalid RB tree") << endl;
		cout << (itree.interval_verify() ? "valid Interval tree" : "invalid Interval tree") << endl;	
	}
	cout << "Enter the interval with format \"low high\": " << endl;
	while(cin >> l >> r){
		Interval interval(l, r);
		// find all valid result
		cout << "Overlap should be one of [";
		bool has_prev = false;
		for(int i = 0; i < intervals.size(); i ++){
			if(Interval::overlap(interval, intervals[i])){
				if(has_prev)
					cout << " ";
				cout << "Interval" << intervals[i];
				has_prev = true;
			}
		}
		cout << "]" << endl;
		cout << "Finding overlap interval of Interval" << interval << "..." << endl;
		// find one overlaping interval
		cout << "Overlap: Interval" << itree.interval_overlap(interval)->get_key() << endl << endl;
		cout << "Enter the interval with format \"low high\": " << endl;
	}
	itree.preorder("NLR.txt");
	itree.inorder("LNR.txt");
	itree.levelorder("LOT.txt");
}
