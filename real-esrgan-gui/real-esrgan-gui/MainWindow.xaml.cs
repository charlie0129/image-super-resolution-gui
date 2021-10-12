using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Controls.Primitives;
using Microsoft.UI.Xaml.Data;
using Microsoft.UI.Xaml.Input;
using Microsoft.UI.Xaml.Media;
using Microsoft.UI.Xaml.Media.Imaging;
using Microsoft.UI.Xaml.Navigation;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices.WindowsRuntime;
using Windows.Foundation;
using Windows.Foundation.Collections;
using System.Runtime.InteropServices;

// To learn more about WinUI, the WinUI project structure,
// and more about our project templates, see: http://aka.ms/winui-project-info.

namespace real_esrgan_gui
{
    /// <summary>
    /// An empty window that can be used on its own or navigated to within a Frame.
    /// </summary>
    public sealed partial class MainWindow : Window
    {
        public MainWindow()
        {
            this.InitializeComponent();
        }

        public List<string> Models { get; } = new List<string>()
        {
            "realesrgan-x4plus",
            "realesrgan-x4plus-anime",
            "realesrnet-x4plus"
        };

        /*public Thickness tipsHeight = new Thickness(0, 0, 0, 100);

        [DllImport("user32.dll", CharSet = CharSet.Auto, ExactSpelling = true)]
        public static extern IntPtr GetForegroundWindow();
        [DllImport("user32.dll")]
        [return: MarshalAs(UnmanagedType.Bool)]
        static extern bool GetWindowRect(IntPtr hWnd, ref RECT lpRect);

        [StructLayout(LayoutKind.Sequential)]
        public struct RECT
        {
            public int Left;                          //最左坐标
            public int Top;                           //最上坐标
            public int Right;                         //最右坐标
            public int Bottom;                        //最下坐标
        }*/

        private bool isImage(String file)
        {
            String[] imageSuffix = new string[] { ".jpg", ".png" };
            for (int i = 0; i < imageSuffix.Length; i++)
                if (file.EndsWith(imageSuffix[i]))
                    return true;
            return false;
        }

        /*private int getWindowHeight()
        {
            IntPtr awin = GetForegroundWindow();
            RECT rect = new RECT();
            GetWindowRect(awin, ref rect);
            return rect.Bottom - rect.Top;
        }*/

        private async void inputImageGrid_Drop(object sender, DragEventArgs e)
        {
            var inputs = await e.DataView.GetStorageItemsAsync();
            if (inputs.Count() == 1)
            {
                String imagePath = inputs[0].Path.ToString();
                if (isImage(imagePath))
                    inputImage.Source = new BitmapImage(new Uri(imagePath));
                else
                {

                    // tipsHeight.Bottom = getWindowHeight() / 2;
                    fileTypeErrorTip.IsOpen = true;
                }
            }
        }

        private void inputImageGrid_DragOver(object sender, DragEventArgs e)
        {
            e.AcceptedOperation = Windows.ApplicationModel.DataTransfer.DataPackageOperation.Copy;

            if (e.DragUIOverride != null)
            {
                e.DragUIOverride.Caption = "选择输入文件";
                e.DragUIOverride.IsContentVisible = true;
            }
        }

        private void inputImageGrid_DragLeave(object sender, DragEventArgs e)
        {

        }
    }
}
