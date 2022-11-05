#include<iostream>
#include<fstream>
#include<sstream>
#include<string>
#include<queue>
using namespace std;

enum RBColor{
	RED = 0,
	BLACK = 1
};
class RBNode{
protected:
	RBColor color;
	int key;
	RBNode* left;
	RBNode* right;
	RBNode* parent;
	
	friend class RBTree;
public:
	static RBNode* null;
	RBNode(int value): color(RED), key(value), left(null), right(null), parent(null){}
	RBNode(){
		key = -1;
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
};
RBNode* RBNode::null = new RBNode();
RBNode* null = RBNode::null;

class RBTree{
private:
	RBNode* root; 	
	
	void preorder(RBNode* node, ofstream& fout){
		if(node == null)
			return;
		fout << node->key << ",\t" << node->get_color() << endl;
		preorder(node->left, fout);
		preorder(node->right, fout);
	}
	void inorder(RBNode* node, ofstream& fout){
		if(node == null)
			return;
		inorder(node->left, fout);
		fout << node->key << ",\t" << node->get_color() << endl;
		inorder(node->right, fout);
	}
	void postorder(RBNode* node, ofstream& fout){
		if(node == null)
			return;
		postorder(node->left, fout);
		postorder(node->right, fout);
		fout << node->key << ",\t" << node->get_color() << endl;
	}
	RBNode* tree_minimum(RBNode* node){
		RBNode* scan = node;
		while(scan->left != null)
			scan = scan->left;
		return scan;
	}
	void rotate_left(RBNode* x){
		RBNode* y = x->right;
		x->right = y->left;
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
	}
	void rotate_right(RBNode* x){
		RBNode* y = x->left;
		x->left = y->right;
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
			
	}
	void rb_transplant(RBNode* u, RBNode* v){
		if(u->parent == null)
			root = v;
		else if(u == u->parent->left)
			u->parent->left = v;
		else
			u->parent->right= v;
		v->parent = u->parent;
	}
	void rb_insert_fixup(RBNode* z){
		while(z->parent->color == RED){
			if(z->parent == z->parent->parent->left){
				RBNode* y = z->parent->parent->right;
				if(y->color == RED){
					// case 1
					// transfer to case 2
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
						cout << "insert case 2" << endl;
						z = z->parent;
						rotate_left(z);
					}
					// case 3
					cout << "insert case 3" << endl;
					z->parent->color = BLACK;
					z->parent->parent->color = RED;
					rotate_right(z->parent->parent);
				}
			}
			else{
				RBNode* y = z->parent->parent->left;
				if(y->color == RED){
					// case 4
					// transfer to case 5
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
						cout << "insert case 5" << endl;
						z = z->parent;
						rotate_right(z);
					}
					// case 6
					cout << "insert case 6" << endl;
					z->parent->color = BLACK;
					z->parent->parent->color = RED;
					rotate_left(z->parent->parent);
				}
				
			}
		}
		root->color = BLACK;
	}
	void rb_delete_fixup(RBNode* x){
		while(x != root && x->color == BLACK){
			if(x == x->parent->left){
				RBNode* w = x->parent->right;
				if(w->color == RED){
					// case 1
					w->color = BLACK;
					x->parent->color = RED;
					rotate_left(x->parent);
					w = x->parent->right;
				}
				if(w->left->color == BLACK && w->right->color == BLACK){
					// case 2
					w->color = RED;
					x = x->parent;
				}
				else{	
					if(w->right->color == BLACK){
						// case 3
						w->left->color = BLACK;
						w->color = RED;
						rotate_right(w);
						w = x->parent->right;
					}
					// case 4
					w->color = x->parent->color;
					x->parent->color = BLACK;
					w->right->color = BLACK;
					rotate_left(x->parent);
					x = root;
				} 
			}
			else{
				RBNode* w = x->parent->left;
				if(w->color == RED){
					// case 5
					w->color = BLACK;
					x->parent->color = RED;
					rotate_right(x->parent);
					w = x->parent->left;
				}
				if(w->left->color == BLACK && w->right->color == BLACK){
					// case 6
					w->color = RED;
					x = x->parent;
				}
				else{	
					if(w->left->color == BLACK){
						// case 7
						w->right->color = BLACK;
						w->color = RED;
						rotate_left(w);
						w = x->parent->left;
					}
					// case 8
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
	pair<bool, int> rb_check(RBNode* node){
		if(node == null){
			return make_pair(true, 0);
		}
		pair<bool, int> res1 = rb_check(node->left), res2 = rb_check(node->right);
		if(!res1.first || !res2.first)
			return make_pair(false, -1);
		if(res1.second != res2.second)
			return make_pair(false, -1);
		if(node->color == RED && (node->left->color != BLACK || node->right->color != BLACK))
			return make_pair(false, -1);
		return make_pair(true, res1.second + (node->color == BLACK ? 1 : 0));
	}
public:
	RBTree(){
		root = null;
		root->parent = null;
	}
	void rb_insert(int value){
		RBNode* node = new RBNode(value);
		if(root == null)
			root = node;
		else{
			RBNode* scan = root;
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
		rb_insert_fixup(node);
	}
	RBNode* rb_search(int key){
		RBNode* scan = root;
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
	void rb_delete(int key){
		RBNode* z = rb_search(key);
		if(z == null)
			return;
		RBNode* y = z;
		RBNode* x = null;
		RBColor y_origin_color = y->color;
		if(z->left == null){
			x = z->right;
			rb_transplant(z, z->right);
		}
		else if(z->right == null){
			x = z->left;
			rb_transplant(z, z->left);
		}
		else{
			y = tree_minimum(z->right);
			y_origin_color = y->color;
			x = y->right;
			
			if(y->parent == z)
				x->parent = y;
			else{
				rb_transplant(y, y->right);
				y->right = z->right;
				y->right->parent = y;
			}
			rb_transplant(z, y);
			y->left = z->left;
			y->left->parent = y;
			y->color = z->color;
		}
		if(y_origin_color == BLACK)
			rb_delete_fixup(x);
	}
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
		queue<RBNode*> q;
		q.push(root);
		while(!q.empty()){
			RBNode* node = q.front();
			q.pop();
			
			fout << node->key << ",\t" << node->get_color() << endl;
			if(node->left != null)
				q.push(node->left);
			if(node->right != null)
				q.push(node->right);
		}
	}
	bool rb_verify(){
		if(root->color != BLACK)
			return false;
		return rb_check(root).first;
	}
};

int main(){
	RBTree rbtree;
	ifstream fin("insert.txt");
	int n;
	fin >> n;
	string line;
	getline(fin, line);
	getline(fin, line);
	stringstream ss(line);
	int key;
	while(ss >> key){
		rbtree.rb_insert(key);
	}
	cout << endl;
	cout << (rbtree.rb_verify() ? "valid RB tree" : "invalid RB tree");
	rbtree.preorder("NLR.txt");
	rbtree.inorder("LNR.txt");
	rbtree.levelorder("LOT.txt");
}
