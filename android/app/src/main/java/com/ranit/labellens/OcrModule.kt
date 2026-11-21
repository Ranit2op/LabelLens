package com.ranit.labellens

import android.net.Uri
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.text.TextRecognition
import com.google.mlkit.vision.text.latin.TextRecognizerOptions

class OcrModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName(): String = "LabelLensOcr"

    private val recognizer = TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS)

    @ReactMethod
    fun recognizeText(imageUriString: String, promise: Promise) {
        try {
            val uri = Uri.parse(imageUriString)
            val image = InputImage.fromFilePath(reactContext, uri)
            recognizer.process(image)
                .addOnSuccessListener { visionText ->
                    promise.resolve(visionText.text)
                }
                .addOnFailureListener { e ->
                    promise.reject("OCR_ERROR", e.localizedMessage, e)
                }
        } catch (e: Exception) {
            promise.reject("OCR_EXCEPTION", e.localizedMessage, e)
        }
    }
}
