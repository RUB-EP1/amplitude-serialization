import ROOT
from ROOT import RooRealVar, RooGaussian, RooWorkspace
from ROOT import RooJSONFactoryWSTool


def export_pdf():
    x = RooRealVar("x", "x", -10, 10)
    mean = RooRealVar("mean", "mean of gaussian", 1, -10, 10)
    sigma = RooRealVar("sigma", "width of gaussian", 1, 0.1, 10)
    gauss = RooGaussian("gauss", "gaussian PDF", x, mean, sigma)

    w = RooWorkspace("ws")
    getattr(w, 'import')(gauss)

    tool = RooJSONFactoryWSTool(w)
    tool.exportJSON("gauss.json")
    return 0

export_pdf()
