#include <stdio.h>
#include "edu_njnu_JNITest.h"

JNIEXPORT jint JNICALL Java_edu_njnu_JNITest_sum
(JNIEnv* env, jobject obj, jint x, jint y)
{
	return x + y;
}