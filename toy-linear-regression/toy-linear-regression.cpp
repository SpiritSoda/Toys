#include<iostream>
#include<fstream>
#include<sstream>
#include<vector>
#include<cmath>
#include<ctime>
#include<cstdlib>
using namespace std;

// debug
template<typename T>
void display_v(vector<T>& V){
	for(int i = 0; i < V.size(); i ++)
		cout << V[i] << " "; 
	cout << endl;
}

// vector operation
double cross(vector<double> v1, vector<double> v2){
	if(v1.size() != v2.size()){
		cout << "Error::can not calculate inner product of vectors with different length ..." << endl;
		return 0.0;
	}
	int n = v1.size();
	double ans = 0.0;
	for(int i = 0; i < n; i ++)
		ans += v1[i] * v2[i];
	return ans;
}
vector<double> diff(vector<double> v1, vector<double> v2){
	if(v1.size() != v2.size()){
		cout << "Error::can not calculate dist of vectors with different length ..." << endl;
		return vector<double>();
	}
	int n = v1.size();
	vector<double> ans = vector<double>(n, 0.0);
	for(int i = 0; i < n; i ++)
		ans[i] = v1[i] - v2[i];
	return ans;
}
vector<double> addv(vector<double> v1, vector<double> v2){
	if(v1.size() != v2.size()){
		cout << "Error::can not calculate add vectors with different length ..." << endl;
		return vector<double>();
	}
	int n = v1.size();
	vector<double> ans = vector<double>(n, 0.0);
	for(int i = 0; i < n; i ++)
		ans[i] = v1[i] + v2[i];
	return ans;
}
vector<double> multi(double k, vector<double> v){
	int n = v.size();
	vector<double> ans = vector<double>(n, 0.0);
	for(int i = 0; i < n; i ++)
		ans[i] = k * v[i];
	return ans;
}
double norm(vector<double> v){
	int n = v.size();
	double s = 0;
	for(int i = 0; i < n; i ++)
		s += v[i] * v[i];
	return sqrt(s);
}
double dist(vector<double> v1, vector<double> v2){
	if(v1.size() != v2.size()){
		cout << "Error::can not calculate dist of vectors with different length ..." << endl;
		return 0.0;
	}
	return norm(diff(v1, v2));
}

const int loop = 5000;
class LinearRegression{
private:
	vector<vector<double>> origin_train;
	vector<vector<double>> train;
	vector<double> train_target;
	
	vector<string> titles;
	string target_title;
	int idx;
	int n;
	int m;
	
	double lambda;
	
	vector<vector<double>> origin_test; 
	vector<vector<double>> test; 
	vector<double> test_target; 
	
	vector<double> W;
	
	double (*modify)(double);
	
	LinearRegression(){
		train.clear();
		test.clear();
		titles.clear();
		target_title = "";
		idx = -1;
		n = 0;
		m = 0;
		lambda = 0.0;
		W.clear();
		modify = LinearRegression::default_modify;
	}
	// check whether executor is ready for train
	bool train_ready(double (*modify)(double)){
		if(lambda == 0.0){
			cout << "Error::learning rate not set ..." << endl;
			return false;
		}
		if(origin_train.size() == 0){
			cout << "Error::train set empty ..." << endl;
			return false;
		}
		n = origin_train.size();
		if(target_title.length() == 0){
			cout << "Error::quality not selected ..." << endl;
			return false;
		}
		for(int i = 0; i < titles.size(); i ++)
			if(titles[i] == target_title){
				idx = i;
				break;
			}
		if(idx == -1){
			cout << "Error::quality not exist ..." << endl;
			return false;
		}
		train = vector<vector<double>>(origin_train.begin(), origin_train.end());
		train_target = vector<double>(n, 0.0);
		for(int i = 0; i < n; i ++){
			train_target[i] = modify(train[i][idx]);
		}
		remove_target(train, idx);
		phi(train);
		return true;
	}
	// check whether executor is ready for test
	bool test_ready(double (*modify)(double)){
		if(origin_test.size() == 0){
			cout << "Error::test set empty ..." << endl;
			return false;
		}
		m = origin_test.size();
		test = vector<vector<double>>(origin_test.begin(), origin_test.end());
		test_target = vector<double>(m, 0.0);
		for(int i = 0; i < m; i ++){
			test_target[i] = modify(test[i][idx]);
		}
		remove_target(test, idx);
		phi(test);
		return true;
	}
	void phi(vector<vector<double>>& v){
		int m = v.size();
		for(int i = 0; i < m; i ++){
			v[i].push_back(1.0);
		}
	}
	// remove the target value in each row
	void remove_target(vector<vector<double>>& v, int idx){
		int n = v.size();
		for(int i = 0; i < n; i ++){
			v[i].erase(v[i].begin() + idx);
		}
	}
public:
	static LinearRegression builder(){
		return LinearRegression();
	}
	static double default_modify(double d){
		return d;
	}
	// read train data set
	LinearRegression load_train(string filepath){
		ifstream fin(filepath);
		string line;
		// read titles
		getline(fin, line);
		string title;
		stringstream ss(line);
		while(ss >> title){
			titles.push_back(title);
		}
		
		// read data
		while(getline(fin, line)){
			vector<double> item;
			stringstream ss(line);
			double d;
			while(ss >> d){
				item.push_back(d);
			}
			origin_train.push_back(item);
		}
		return *this;
	}
	// read test data set
	LinearRegression load_test(string filepath){
		ifstream fin(filepath);
		string line;
		while(getline(fin, line)){
			vector<double> item;
			stringstream ss(line);
			double d;
			while(ss >> d){
				item.push_back(d);
			}
			origin_test.push_back(item);
		}
		return *this;
	}
	// set the target value
	LinearRegression target(string target){
		this->target_title = target;
		return *this;
	}
	// set the learning rate
	LinearRegression rate(double lambda){
		this->lambda = lambda;
		return *this;
	}
	// set how to modify target value
	LinearRegression modifier(double (*modify)(double)){
		this->modify = modify;
		return *this;
	}
	// unset modifier
	LinearRegression unmodifier(){
		this->modify = NULL;
		return *this;
	}
	// train
	void model(){
		if(!train_ready(LinearRegression::default_modify)){
			cout << "Error::linear regression train is not fully prepared ..." << endl;
			return;
		}
		int length = train[0].size();
		
		srand(time(0));
		W = vector<double>(length, 0.0);
		for(int i = 0; i < length; i ++)
			W[i] = (double)((rand() % 2000) - 1000) / 10000.0;
		for(int t = 0; t < loop; t ++){
			vector<double> dW = vector<double>(length, 0.0);
			for(int i = 0; i < n; i ++){
				double k = 2 * (cross(W, train[i]) - train_target[i]) / n;
				vector<double> v = multi(k, train[i]);
				dW = addv(dW, v);
			}
			W = diff(W, multi(lambda, dW));
		}
	}
	// evaluate error
	double eval(){
		if(!test_ready(LinearRegression::default_modify)){
			cout << "Error::linear regression test is not fully prepared ..." << endl;
			return 0.0;
		}
		double eval = 0.0;
		for(int i = 0; i < m; i ++){
			double predict = cross(test[i], W);
			eval += (predict - test_target[i]) * (predict - test_target[i]);
		}
		return eval;
	}
	// train classification
	void classify(){
		if(!train_ready(modify)){
			cout << "Error::linear regression train is not fully prepared ..." << endl;
			return;
		}
		int length = train[0].size();
		
		srand(time(0));
		W = vector<double>(length, 0.0);
		for(int i = 0; i < length; i ++)
			W[i] = (double)((rand() % 2000) - 1000) / 10000.0;
		for(int t = 0; t < loop; t ++){
			vector<double> dW = vector<double>(length, 0.0);
			for(int i = 0; i < n; i ++){
				double k = (cross(W, train[i])) * train_target[i] >= 1 ? 0 : (double)- train_target[i];
				vector<double> v = multi(k, train[i]);
				W = diff(W, multi(lambda, v));
			}
		}
	}
	// evaluate accuracy
	double accurate(){
		if(!test_ready(modify)){
			cout << "Error::linear regression test is not fully prepared ..." << endl;
			return 0.0;
		}
		int fit = 0;
		for(int i = 0; i < m; i ++){
			double predict = (cross(test[i], W) > 0 ? 1 : -1);
			if(abs(test_target[i] - predict) < 1e-6)
				fit ++;
		}
		return (double) fit / m;
	}
};
double classifier(double v){
	if(v >= 6)
		return 1;
	else
		return -1;
}
int main(){
	LinearRegression app = LinearRegression::builder().load_train("data_train.txt").rate(0.0001).target("quality").load_test("data_test.txt");
	app.model();
	cout << "Total error on test set: " << app.eval() << endl;
	cout << "Error evaluation: sum of (f(x) - h(x))^2" << endl;
	app.modifier(classifier);
	app.classify();
	cout << "Total accurate on test set: " << app.accurate() << endl;
	cout << "Accuracy evaluation: rate of f(x) == h(x)" << endl;
} 
